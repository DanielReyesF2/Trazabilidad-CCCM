import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { insertWasteDataSchema, type Client } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { CalendarIcon, Loader2, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from "@/components/ui/switch";

// Extend the waste data schema with additional validation
const formSchema = insertWasteDataSchema.extend({
  date: z.date({
    required_error: "La fecha es requerida",
  }),
  clientId: z.number({
    required_error: "El cliente es requerido",
  }),
  organicWaste: z.coerce.number().min(0, { message: "El valor debe ser mayor o igual a 0" }),
  inorganicWaste: z.coerce.number().min(0, { message: "El valor debe ser mayor o igual a 0" }),
  recyclableWaste: z.coerce.number().min(0, { message: "El valor debe ser mayor o igual a 0" }),
  podaWaste: z.coerce.number().min(0, { message: "El valor debe ser mayor o igual a 0" }),
  
  // Desglose de reciclables (opcional)
  hasDetailedRecyclables: z.boolean().optional().default(false),
  cardboard: z.coerce.number().min(0).optional(),
  paper: z.coerce.number().min(0).optional(),
  newspaper: z.coerce.number().min(0).optional(),
  plasticPET: z.coerce.number().min(0).optional(),
  plasticOther: z.coerce.number().min(0).optional(),
  metalAluminum: z.coerce.number().min(0).optional(),
  glass: z.coerce.number().min(0).optional(),
});

type WasteDataFormValues = z.infer<typeof formSchema>;

interface WasteDataFormProps {
  clients: Client[];
  onSuccess?: () => void;
}

export default function WasteDataForm({ clients, onSuccess }: WasteDataFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDetailedForm, setShowDetailedForm] = useState(false);
  
  // Use the default client if only one is provided
  const defaultClient = clients.length === 1 ? clients[0].id : undefined;
  
  const form = useForm<WasteDataFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: defaultClient,
      organicWaste: 0,
      inorganicWaste: 0,
      recyclableWaste: 0,
      podaWaste: 0,
      documentId: null, // No document associated with manual entries
      date: new Date(),
      hasDetailedRecyclables: false,
      // Los valores del desglose de reciclables inician en 0
      cardboard: 0,
      paper: 0,
      newspaper: 0,
      plasticPET: 0,
      plasticOther: 0,
      metalAluminum: 0,
      glass: 0
    },
  });
  
  // Monitor the detailed recyclables fields to ensure they sum to the total recyclable waste
  const watchRecyclableWaste = form.watch('recyclableWaste');
  const watchHasDetailed = form.watch('hasDetailedRecyclables');
  const watchCardboard = form.watch('cardboard') || 0;
  const watchPaper = form.watch('paper') || 0;
  const watchNewspaper = form.watch('newspaper') || 0;
  const watchPlasticPET = form.watch('plasticPET') || 0;
  const watchPlasticOther = form.watch('plasticOther') || 0;
  const watchMetalAluminum = form.watch('metalAluminum') || 0;
  const watchGlass = form.watch('glass') || 0;
  
  // Calculate sum of detailed recyclables
  const detailedSum = 
    watchCardboard + 
    watchPaper + 
    watchNewspaper + 
    watchPlasticPET + 
    watchPlasticOther + 
    watchMetalAluminum + 
    watchGlass;
  
  const detailedDifference = watchRecyclableWaste - detailedSum;
  
  const handleDetailedChange = (showDetailed: boolean) => {
    setShowDetailedForm(showDetailed);
    form.setValue('hasDetailedRecyclables', showDetailed);
  };
  
  async function onSubmit(values: WasteDataFormValues) {
    setIsSubmitting(true);
    
    try {
      // Calculate total waste and deviation
      const totalWaste = 
        values.organicWaste + 
        values.inorganicWaste + 
        values.recyclableWaste + 
        values.podaWaste;
      
      // Calculate deviation using only recyclable and PODA waste
      // Formula: (recyclable + poda) / total * 100
      const deviation = totalWaste > 0 
        ? ((values.recyclableWaste + values.podaWaste) / totalWaste) * 100 
        : 0;
      
      // Si el usuario no ingresó el desglose detallado, eliminamos los valores
      // para que no se guarden en la base de datos
      if (!values.hasDetailedRecyclables) {
        values.cardboard = undefined;
        values.paper = undefined;
        values.newspaper = undefined;
        values.plasticPET = undefined;
        values.plasticOther = undefined;
        values.metalAluminum = undefined;
        values.glass = undefined;
      }
      
      // Build the payload
      const payload = {
        ...values,
        totalWaste,
        deviation: Math.round(deviation * 100) / 100, // Round to 2 decimal places
      };
      
      // Submit the data
      const response = await fetch('/api/waste-data/manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error('Error al guardar los datos');
      }
      
      // Success
      toast({
        title: "Datos guardados correctamente",
        description: "Los datos de residuos se han registrado con éxito.",
      });
      
      // Reset the form
      form.reset({
        clientId: defaultClient,
        organicWaste: 0,
        inorganicWaste: 0,
        recyclableWaste: 0,
        podaWaste: 0,
        documentId: null,
        date: new Date(),
        hasDetailedRecyclables: false,
        cardboard: 0,
        paper: 0,
        newspaper: 0,
        plasticPET: 0,
        plasticOther: 0,
        metalAluminum: 0,
        glass: 0
      });
      
      setShowDetailedForm(false);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/waste-data'] });
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting waste data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al guardar los datos de residuos.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Instrucciones simples para el usuario */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="text-lg font-medium text-blue-800 mb-2">Instrucciones</h3>
            <ul className="text-sm text-blue-700 space-y-1 list-disc pl-5">
              <li>Ingrese la cantidad de residuos generados en kilogramos</li>
              <li>La fecha debe ser la del día en que se generaron los residuos</li>
              <li>Los valores deben ser números positivos</li>
              <li>Use el botón "Agregar detalles de reciclables" si desea registrar el desglose específico</li>
            </ul>
          </div>

          {/* Fecha - siempre visible y fácil de usar */}
          <div className="bg-white p-4 rounded-lg border">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-base font-medium">¿Qué día se generaron los residuos?</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal text-base h-12",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            <span className="text-base">{format(field.value, "PPPP", { locale: es })}</span>
                          ) : (
                            <span>Seleccionar fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-5 w-5 opacity-70" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date()}
                        initialFocus
                        className="rounded-md border"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        {/* Formulario principal con grandes inputs para fácil entrada de datos */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-medium mb-4">Ingrese los kilos de residuos generados</h3>
          
          <div className="grid grid-cols-1 gap-6">
            {/* Organic Waste */}
            <FormField
              control={form.control}
              name="organicWaste"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Residuos Orgánicos (Comedor)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="text-lg h-12 pl-4 pr-12"
                        {...field}
                      />
                      <span className="absolute right-4 top-3 text-gray-500">kg</span>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Restos de comida, frutas, verduras, etc.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* PODA Waste */}
            <FormField
              control={form.control}
              name="podaWaste"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Residuos de PODA (Jardín)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="text-lg h-12 pl-4 pr-12"
                        {...field}
                      />
                      <span className="absolute right-4 top-3 text-gray-500">kg</span>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Hojas, ramas, pasto cortado, etc.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Inorganic Waste */}
            <FormField
              control={form.control}
              name="inorganicWaste"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Residuos Inorgánicos</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="text-lg h-12 pl-4 pr-12"
                        {...field}
                      />
                      <span className="absolute right-4 top-3 text-gray-500">kg</span>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Residuos que van al relleno sanitario (no reciclables)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Recyclable Waste */}
            <FormField
              control={form.control}
              name="recyclableWaste"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Residuos Reciclables (Total)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="text-lg h-12 pl-4 pr-12"
                        {...field}
                      />
                      <span className="absolute right-4 top-3 text-gray-500">kg</span>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Total de residuos reciclables (papel, cartón, plástico, vidrio, etc.)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        {/* Botón expandir/colapsar el detalle de reciclables */}
        <div className="flex items-center space-x-2">
          <Switch 
            checked={showDetailedForm}
            onCheckedChange={handleDetailedChange}
            id="detailed-toggle"
          />
          <label 
            htmlFor="detailed-toggle" 
            className="cursor-pointer text-base font-medium"
          >
            Quiero agregar detalles de reciclables
          </label>
        </div>
        
        {/* Desglose de reciclables (expandible) */}
        {showDetailedForm && (
          <Card className="border border-lime rounded-lg">
            <CardContent className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium">Desglose de Materiales Reciclables</h3>
                <p className="text-sm text-gray-500">
                  Ingrese el detalle de los materiales reciclables (la suma debe ser igual al total de reciclables)
                </p>
                
                {detailedDifference !== 0 && (
                  <div className={`mt-2 p-2 rounded text-sm font-medium ${detailedDifference > 0 ? 'bg-yellow-50 text-yellow-800' : 'bg-red-50 text-red-800'}`}>
                    {detailedDifference > 0 ? (
                      <>Faltan {detailedDifference.toFixed(2)} kg por asignar</>
                    ) : (
                      <>El desglose excede al total por {Math.abs(detailedDifference).toFixed(2)} kg</>
                    )}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cardboard */}
                <FormField
                  control={form.control}
                  name="cardboard"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center space-x-2">
                        <div className="bg-orange-100 w-6 h-6 flex items-center justify-center rounded-full">
                          <span className="text-orange-600 text-xs font-bold">CA</span>
                        </div>
                        <FormLabel className="font-medium">Cartón</FormLabel>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            className="text-base pl-3 pr-10"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => {
                              const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                              field.onChange(val);
                            }}
                          />
                          <span className="absolute right-3 top-2 text-gray-500 text-sm">kg</span>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                {/* Paper */}
                <FormField
                  control={form.control}
                  name="paper"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center space-x-2">
                        <div className="bg-blue-100 w-6 h-6 flex items-center justify-center rounded-full">
                          <span className="text-blue-600 text-xs font-bold">PA</span>
                        </div>
                        <FormLabel className="font-medium">Papel</FormLabel>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            className="text-base pl-3 pr-10"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => {
                              const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                              field.onChange(val);
                            }}
                          />
                          <span className="absolute right-3 top-2 text-gray-500 text-sm">kg</span>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                {/* Newspaper */}
                <FormField
                  control={form.control}
                  name="newspaper"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center space-x-2">
                        <div className="bg-gray-100 w-6 h-6 flex items-center justify-center rounded-full">
                          <span className="text-gray-600 text-xs font-bold">PE</span>
                        </div>
                        <FormLabel className="font-medium">Periódico</FormLabel>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            className="text-base pl-3 pr-10"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => {
                              const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                              field.onChange(val);
                            }}
                          />
                          <span className="absolute right-3 top-2 text-gray-500 text-sm">kg</span>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                {/* Plastic PET */}
                <FormField
                  control={form.control}
                  name="plasticPET"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center space-x-2">
                        <div className="bg-purple-100 w-6 h-6 flex items-center justify-center rounded-full">
                          <span className="text-purple-600 text-xs font-bold">PET</span>
                        </div>
                        <FormLabel className="font-medium">Plástico PET</FormLabel>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            className="text-base pl-3 pr-10"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => {
                              const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                              field.onChange(val);
                            }}
                          />
                          <span className="absolute right-3 top-2 text-gray-500 text-sm">kg</span>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                {/* Other Plastics */}
                <FormField
                  control={form.control}
                  name="plasticOther"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center space-x-2">
                        <div className="bg-pink-100 w-6 h-6 flex items-center justify-center rounded-full">
                          <span className="text-pink-600 text-xs font-bold">PL</span>
                        </div>
                        <FormLabel className="font-medium">Otros Plásticos</FormLabel>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            className="text-base pl-3 pr-10"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => {
                              const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                              field.onChange(val);
                            }}
                          />
                          <span className="absolute right-3 top-2 text-gray-500 text-sm">kg</span>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                {/* Metal/Aluminum */}
                <FormField
                  control={form.control}
                  name="metalAluminum"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center space-x-2">
                        <div className="bg-yellow-100 w-6 h-6 flex items-center justify-center rounded-full">
                          <span className="text-yellow-600 text-xs font-bold">AL</span>
                        </div>
                        <FormLabel className="font-medium">Metal/Aluminio</FormLabel>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            className="text-base pl-3 pr-10"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => {
                              const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                              field.onChange(val);
                            }}
                          />
                          <span className="absolute right-3 top-2 text-gray-500 text-sm">kg</span>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                {/* Glass */}
                <FormField
                  control={form.control}
                  name="glass"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center space-x-2">
                        <div className="bg-green-100 w-6 h-6 flex items-center justify-center rounded-full">
                          <span className="text-green-600 text-xs font-bold">VI</span>
                        </div>
                        <FormLabel className="font-medium">Vidrio</FormLabel>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            className="text-base pl-3 pr-10"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => {
                              const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                              field.onChange(val);
                            }}
                          />
                          <span className="absolute right-3 top-2 text-gray-500 text-sm">kg</span>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Total detallado: <span className={detailedDifference !== 0 ? 'text-red-500 font-bold' : 'text-green-600 font-bold'}>
                    {detailedSum.toFixed(2)} kg
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Total de reciclables: <span className="font-bold">{watchRecyclableWaste.toFixed(2)} kg</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Client Selection - Only show if multiple clients, hidden by default for simplicity */}
        {clients.length > 1 && (
          <div className="bg-gray-50 p-4 rounded-lg border mt-6">
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Cliente</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="text-base h-12">
                        <SelectValue placeholder="Seleccionar cliente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="text-lg h-12 px-8 bg-lime hover:bg-lime/90 text-black"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Registro"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
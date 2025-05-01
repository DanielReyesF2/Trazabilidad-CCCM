import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@lib/queryClient";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Esquema de validación
const wasteDataSchema = z.object({
  clientId: z.coerce.number({
    required_error: "Por favor selecciona un cliente",
  }),
  date: z.date({
    required_error: "Por favor selecciona una fecha",
  }),
  organicWaste: z.coerce.number().nonnegative().optional().default(0),
  inorganicWaste: z.coerce.number().nonnegative().optional().default(0),
  recyclableWaste: z.coerce.number().nonnegative().optional().default(0),
  podaWaste: z.coerce.number().nonnegative().optional().default(0),
  notes: z.string().optional(),
});

type WasteDataFormValues = z.infer<typeof wasteDataSchema>;

interface WasteDataFormProps {
  clients: Array<{ id: number; name: string }>;
  onSuccess?: () => void;
}

export default function WasteDataForm({ clients, onSuccess }: WasteDataFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  
  const defaultValues: Partial<WasteDataFormValues> = {
    date: new Date(),
    organicWaste: 0,
    inorganicWaste: 0,
    recyclableWaste: 0,
    podaWaste: 0,
  };
  
  const form = useForm<WasteDataFormValues>({
    resolver: zodResolver(wasteDataSchema),
    defaultValues,
  });
  
  async function onSubmit(data: WasteDataFormValues) {
    setIsSubmitting(true);
    try {
      // Convertir toneladas a kg (la API espera valores en kg)
      const submitData = {
        ...data,
        organicWaste: data.organicWaste * 1000,
        inorganicWaste: data.inorganicWaste * 1000,
        recyclableWaste: data.recyclableWaste * 1000,
        podaWaste: data.podaWaste * 1000,
      };
      
      await apiRequest('/api/waste-data/manual', {
        method: 'POST',
        body: JSON.stringify(submitData),
      });
      
      // Invalidar queries para actualizar la data
      queryClient.invalidateQueries({ queryKey: ['/api/waste-data'] });
      
      toast({
        title: "Registro exitoso",
        description: "Los datos de residuos han sido registrados correctamente",
      });
      
      // Resetear formulario
      form.reset(defaultValues);
      
      // Callback de éxito
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error) {
      console.error("Error al registrar datos:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al registrar los datos de residuos",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Registro de Generación de Residuos</CardTitle>
        <CardDescription>
          Captura manual de los datos diarios de generación de residuos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
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
              
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Seleccionar fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="organicWaste"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Residuos Orgánicos (ton)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0"
                        placeholder="0.00" 
                        {...field} 
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Residuos de comedor y jardinería (no poda)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="inorganicWaste"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Residuos Inorgánicos (ton)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0"
                        placeholder="0.00" 
                        {...field} 
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Residuos no reciclables que van a relleno sanitario
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="recyclableWaste"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Residuos Reciclables (ton)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0"
                        placeholder="0.00" 
                        {...field} 
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Papel, cartón, plástico, vidrio, metal, etc.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="podaWaste"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Residuos de Poda (ton)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0"
                        placeholder="0.00" 
                        {...field} 
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Residuos de poda de áreas verdes
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas adicionales</FormLabel>
                  <FormControl>
                    <Input placeholder="Observaciones o comentarios sobre los residuos" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar Registro"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <p className="text-sm text-muted-foreground">
          Nota: Los datos se registran en toneladas y se convierten a kilogramos para almacenamiento.
        </p>
      </CardFooter>
    </Card>
  );
}
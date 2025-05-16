
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tables } from "@/integrations/supabase/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MapPin, Plus, Trash2, Edit, Home } from "lucide-react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import ToggleField from "@/components/admin/form/ToggleField";

const locationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  phone_number: z.string().optional(),
  is_default: z.boolean().default(false),
});

type LocationFormValues = z.infer<typeof locationSchema>;

const LocationForm = ({ onSuccess, location }: { 
  onSuccess: () => void, 
  location?: Tables<'locations'> 
}) => {
  const { toast } = useToast();
  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: location?.name || "",
      address: location?.address || "",
      phone_number: location?.phone_number || "",
      is_default: location?.is_default || false,
    },
  });

  const onSubmit = async (values: LocationFormValues) => {
    try {
      // If is_default is true, update all other locations to be non-default
      if (values.is_default) {
        await supabase
          .from("locations")
          .update({ is_default: false })
          .neq("id", location?.id || "");
      }

      if (location) {
        // Update existing location
        const { error } = await supabase
          .from("locations")
          .update({
            name: values.name,
            address: values.address,
            phone_number: values.phone_number,
            is_default: values.is_default,
            updated_at: new Date().toISOString(),
          })
          .eq("id", location.id);

        if (error) throw error;
      } else {
        // Create new location
        const { error } = await supabase.from("locations").insert({
          name: values.name,
          address: values.address,
          phone_number: values.phone_number,
          is_default: values.is_default,
        });

        if (error) throw error;
      }

      toast({
        title: location ? "Location updated" : "Location added",
        description: `The location has been successfully ${location ? "updated" : "added"}`,
      });

      form.reset();
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter location name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Enter full address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter phone number (optional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <ToggleField
          name="is_default"
          label="Default Location"
          description="Set as the default location for new users"
        />

        <Button type="submit" className="w-full">
          {location ? "Update Location" : "Add Location"}
        </Button>
      </form>
    </Form>
  );
};

const AdminLocations = () => {
  const [locations, setLocations] = useState<Tables<'locations'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editLocation, setEditLocation] = useState<Tables<'locations'> | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .order("name");

      if (error) throw error;
      setLocations(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching locations",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Check if there are any kitchens using this location
      const { data: kitchens, error: kitchensError } = await supabase
        .from("kitchens")
        .select("id")
        .eq("location_id", id);

      if (kitchensError) throw kitchensError;

      if (kitchens && kitchens.length > 0) {
        toast({
          title: "Cannot delete location",
          description: `There are ${kitchens.length} kitchens linked to this location. Please reassign or delete them first.`,
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("locations").delete().eq("id", id);
      
      if (error) throw error;
      
      toast({
        title: "Location deleted",
        description: "The location has been successfully removed",
      });
      
      fetchLocations();
    } catch (error: any) {
      toast({
        title: "Error deleting location",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      // First, set all locations as non-default
      const { error: clearError } = await supabase
        .from("locations")
        .update({ is_default: false })
        .neq("id", id);
      
      if (clearError) throw clearError;
      
      // Then set the selected location as default
      const { error } = await supabase
        .from("locations")
        .update({ is_default: true })
        .eq("id", id);
      
      if (error) throw error;
      
      toast({
        title: "Default location updated",
        description: "The default location has been successfully updated",
      });
      
      fetchLocations();
    } catch (error: any) {
      toast({
        title: "Error updating default location",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-green-800">Manage Locations</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-4 w-4" /> Add Location
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Location</DialogTitle>
            </DialogHeader>
            <LocationForm 
              onSuccess={() => {
                setIsAddDialogOpen(false);
                fetchLocations();
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Default</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No locations found. Add your first location!
                  </TableCell>
                </TableRow>
              ) : (
                locations.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell className="font-medium">{location.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                        {location.address}
                      </div>
                    </TableCell>
                    <TableCell>{location.phone_number || "Not provided"}</TableCell>
                    <TableCell>
                      {location.is_default ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Home className="h-3 w-3 mr-1" /> Default
                        </span>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleSetDefault(location.id)}
                          className="text-xs text-gray-500 hover:text-green-600"
                        >
                          Set as default
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-green-300 text-green-700 hover:text-green-800 hover:bg-green-50"
                            onClick={() => setEditLocation(location)}
                          >
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Edit Location</DialogTitle>
                          </DialogHeader>
                          {editLocation && (
                            <LocationForm 
                              location={editLocation} 
                              onSuccess={() => {
                                setEditLocation(null);
                                fetchLocations();
                              }} 
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(location.id)}
                        className="border-red-300 text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={location.is_default}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminLocations;


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import LocationSelector from "@/components/LocationSelector";

const LocationLanding = () => {
  const navigate = useNavigate();

  const handleLocationSelect = (location: Tables<'locations'>) => {
    // Use location id since nick_name doesn't exist in current schema
    navigate(`/location/${location.id}`);
  };

  return <LocationSelector onLocationSelect={handleLocationSelect} />;
};

export default LocationLanding;

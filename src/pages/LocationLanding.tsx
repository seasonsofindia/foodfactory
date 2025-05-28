
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import LocationSelector from "@/components/LocationSelector";

const LocationLanding = () => {
  const navigate = useNavigate();

  const handleLocationSelect = (location: Tables<'locations'>) => {
    navigate(`/location/${location.nick_name}`);
  };

  return <LocationSelector onLocationSelect={handleLocationSelect} />;
};

export default LocationLanding;

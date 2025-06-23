interface MapboxFeature {
    place_type: string[];
    place_name: string;
    text: string;
  }
  
  interface MapboxResponse {
    features?: MapboxFeature[];
  }
  
  export async function getLocationInfo(lng: number, lat: number): Promise<{ street: string; city: string }> {
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`
        );
        const data: MapboxResponse = await response.json();
  
        if (data.features && data.features.length > 0) {
          const features = data.features;
          let street = '';
          let city = '';
  
          // Find street/address
          const addressFeature = features.find((f: MapboxFeature) =>
            f.place_type.includes('address') || f.place_type.includes('poi')
          );
          if (addressFeature) {
            street = addressFeature.place_name.split(',')[0];
          }
  
          // Find city
          const cityFeature = features.find((f: MapboxFeature) =>
            f.place_type.includes('place')
          );
          if (cityFeature) {
            city = cityFeature.text;
          }
  
          return { street: street || 'Unknown', city: city || 'Unknown' };
        }
        // Ensure a return value if features are missing or empty
        return { street: 'Unknown', city: 'Unknown' };
      } catch (error) {
        console.error('Reverse geocoding error:', error);
        return { street: 'Error', city: 'Error' };
      }
    };
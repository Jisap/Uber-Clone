import { calculateRegion } from "@/lib/map";
import { useLocationStore } from "@/store";
import { Text, View } from "react-native"
import MapView, { PROVIDER_DEFAULT } from "react-native-maps"

const Map = () => {

  const {
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationLongitude,
  } = useLocationStore();

  const region = calculateRegion({
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
  })
console.log('region',region);
  return (
    <MapView
      provider={PROVIDER_DEFAULT}
      className="w-full h-full rounded-2xl"
      tintColor="black"
      mapType="mutedStandard"
      showsPointsOfInterest={false}
      initialRegion={region}
      showsUserLocation={true}
      userInterfaceStyle="light"
    >
      <Text>
        Map
      </Text>
    </MapView>
  )
}

export default Map
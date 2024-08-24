import { Image, Text, View } from 'react-native'
import { Ride } from '@/types/type'



const RideCard = ({ ride: {
  destination_longitude,
  destination_latitude,
  destination_address,
  origin_address,
  created_at,
  ride_time,
  driver,
  payment_status
} }: { ride: Ride }) => {
  return (
    <View className="flex flex-row items-center justify-center bg-white rounded-lg shadow-sm shadow-neutral-300 mb-3">
      <View className="flex flex-col items-start justify-center p-3">
        <View className="flex flex-row items-center justify-between">
          <Image
            source={{
              uri: `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=400&center=lonlat:${destination_longitude},${destination_latitude}&zoom=14&apiKey=${process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY}`,
            }}
            className="w-[80px] h-[90px] rounded-lg"
          />

          
        </View>
      </View>
      
    </View>
  )
}

export default RideCard
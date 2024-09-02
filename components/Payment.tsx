import { Alert, Image, Text, View } from "react-native"
import CustomButton from "./CustomButton";
import { PaymentProps } from "@/types/type";
import { PaymentSheetError, useStripe } from "@stripe/stripe-react-native";
import { useLocationStore } from "@/store";
import { useAuth } from "@clerk/clerk-expo";
import { useEffect, useState } from "react";
import ReactNativeModal from 'react-native-modal';
import { images } from "@/constants";
import { router } from "expo-router";
import { fetchAPI } from "@/lib/fetch";



const Payment = ({
  fullName,
  email,
  amount,
  driverId,
  rideTime,
}: PaymentProps) => {

  const {
    userAddress,
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationAddress,
    destinationLongitude,
  } = useLocationStore();

  const { userId } = useAuth();
  const [success, setSuccess] = useState<boolean>(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const initializePaymentSheet = async () => {    // Configura el Payment Sheet de Stripe

    const { error } = await initPaymentSheet({    // con initPaymentSheet función que recoje
      merchantDisplayName: "Example, Inc.",       // el nombre del comerciante
      intentConfiguration: {                      // y la configuración de la intención de pago
        mode: {
          amount: parseInt(amount) * 100,
          currencyCode: "usd",
        },
        confirmHandler: async (                   // confirmHandler maneja el proceso de pago  
          paymentMethod,                          // el método de pago es seleccionado por el user en la ventana del initPaymentSheet
          shouldSavePaymentMethod,
          intentCreationCallback,
        ) => {
          const { paymentIntent, customer } = await fetchAPI(     // Realiza llamadas a la API para crear la intención de pago y procesar el pago
            "/(api)/(stripe)/create",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: fullName || email.split("@")[0],
                email: email,
                amount: amount,
                paymentMethodId: paymentMethod.id,
              }),
            },
          );

          if (paymentIntent.client_secret) {                            // Si el pago es exitoso se obtiene un client-secret válido
            const { result } = await fetchAPI("/(api)/(stripe)/pay", {  // se procede a crear el registro del viaje.
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                payment_method_id: paymentMethod.id,
                payment_intent_id: paymentIntent.id,
                customer_id: customer,
                client_secret: paymentIntent.client_secret,
              }),
            });

            if (result.client_secret) {
              await fetchAPI("/(api)/ride/create", {  // Esta información se envía al servidor, donde se almacena en una base de datos para mantener un registro de todos los viajes realizados.
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  origin_address: userAddress,
                  destination_address: destinationAddress,
                  origin_latitude: userLatitude,
                  origin_longitude: userLongitude,
                  destination_latitude: destinationLatitude,
                  destination_longitude: destinationLongitude,
                  ride_time: rideTime.toFixed(0),
                  fare_price: parseInt(amount) * 100,
                  payment_status: "paid",
                  driver_id: driverId,
                  user_id: userId,
                }),
              });

              intentCreationCallback({
                clientSecret: result.client_secret,
              });
            }
          }
        },
      },
      returnURL: "myapp://book-ride",
    });

    if (!error) {
      // setLoading(true);
    }
  };





  const openPaymentSheet = async() => {
    await initializePaymentSheet()
    const {error} = await presentPaymentSheet()
    if(error){
      if(error.code === PaymentSheetError.Canceled){
        Alert.alert(`Error code: ${error.code}`, error.message)
      }else{
        setSuccess(true);
      }
    }
  }


  return (
    <>
      <CustomButton 
        title="Confirm Ride"
        className="my-10"
        onPress={openPaymentSheet}
      />

      <ReactNativeModal
        isVisible={success}
        onBackdropPress={() => setSuccess(false)}
      >
        <View className="flex flex-col items-center justify-center bg-white p-7 rounded-2xl">
          <Image source={images.check} className="w-28 h-28 mt-5" />

          <Text className="text-2xl text-center font-JakartaBold mt-5">
            Booking placed successfully
          </Text>

          <Text className="text-md text-general-200 font-JakartaRegular text-center mt-3">
            Thank you for your booking. Your reservation has been successfully
            placed. Please proceed with your trip.
          </Text>

          <CustomButton
            title="Back Home"
            onPress={() => {
              setSuccess(false);
              router.push("/(root)/(tabs)/home");
            }}
            className="mt-5"
          />
        </View>
      </ReactNativeModal>
    </>
  )
}

export default Payment;
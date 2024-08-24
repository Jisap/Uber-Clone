import { Alert, Image, ScrollView, Text, View } from "react-native"
import { icons, images } from "@/constants";
import InputField from "@/components/InputField";
import { useState } from "react";
import CustomButton from "@/components/CustomButton";
import { Link, router } from "expo-router";
import OAuth from "@/components/Oauth";
import { useSignUp } from "@clerk/clerk-expo";
import ReactNativeModal from "react-native-modal";
import { fetchAPI } from "@/lib/fetch";


const SignUp = () => {

  const { isLoaded, signUp, setActive } = useSignUp();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [verification, setVerification] = useState({
    state: 'default',
    error: '',
    code: '',
  });

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });


  const onSignUpPress = async () => { // Se activa desde el boton de submit y recibe el state del form
    if (!isLoaded) {
      return
    }

    try {
      await signUp.create({           // Lo envía a Clerk
        emailAddress: form.email,
        password: form.password,
      })

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })  // Clerk envía un email con un código

      setVerification({               // Se establece el estate de verification como 'pending'
        ...verification,
        state: 'pending'
      })
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2))
      Alert.alert("Error", err.errors[0].longMessage);
    }
  }

  const onPressVerify = async () => { // Se activa desde el boton del modal de verificación
    if (!isLoaded) return

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({ // Recoge el state de ver.code y lo envía a clerk
        code: verification.code,
      })

      if (completeSignUp.status === 'complete') {                           // Clerk devuelve un status -> modifica states de verification                     
        
        await fetchAPI('/(api)/user', {                                     // Creamos user en base de datos
          method: "POST",
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            clerkId: completeSignUp.createdUserId
          })  
        })

        await setActive({ session: completeSignUp.createdSessionId })
        setVerification({
          ...verification,
          state: 'success'  // "pending"  -> modal -> código -> "success" -> showmodal=true -> modal ok
        })
      } else {
        setVerification({
          ...verification,
          error: 'Verification failed',
          state: 'failed'   // "pending"  -> modal -> código -> "failed" -> showmodal=false -> modal error
        })
      }
    } catch (err: any) {
      setVerification({
        ...verification,
        error: err.errors[0].longMessage,
        state: 'failed',
      })
    }
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="relative w-full h-[250px]">
          <Image
            source={images.signUpCar}
            className="z-0 w-full h-[250px]"
          />
          <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
            Create Your Account
          </Text>
        </View>

        <View className="p-5">
          {/* Los InputField modifican el state del form*/}
          <InputField
            label="Name"
            placeholder="Enter your name"
            icon={icons.person}
            value={form.name}
            onChangeText={(value) => setForm({ ...form, name: value })}
          />
          <InputField
            label="Email"
            placeholder="Enter email"
            icon={icons.email}
            textContentType="emailAddress"
            value={form.email}
            onChangeText={(value) => setForm({ ...form, email: value })}
          />
          <InputField
            label="Password"
            placeholder="Enter password"
            icon={icons.lock}
            secureTextEntry={true}
            textContentType="password"
            value={form.password}
            onChangeText={(value) => setForm({ ...form, password: value })}
          />

          {/* Los CustonButton llaman a funciones que trabajan con los states del form */}
          <CustomButton
            title="Sign Up"
            onPress={onSignUpPress}
            className="mt-6"
          />

          {/* OAuth */}
          <OAuth />

          <Link
            href="/sign-in"
            className="text-lg text-center text-general-200 mt-10"
          >
            Already have an account?{" "}
            <Text className="text-primary-500">Log In</Text>
          </Link>
        </View>

        {/* Verification modal */}
        <ReactNativeModal 
          isVisible={verification.state === "pending"}    // Se muestra este modal si ver.state="pending"
          onModalHide={() => {                            // Cuando el modal se oculta 
            if(verification.state === 'success'){         // se verifica que el ver.state="success"
              setShowSuccessModal(true)                   // si es así showSuccessModal=true
            }
          }}
        >
          <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
            <Text className="font-JakartaExtraBold text-2xl mb-2">
              Verification
            </Text>
            <Text className="font-Jakarta mb-5">
              We've sent a verification code to {form.email}.
            </Text>
            <InputField
              label={"Code"}
              icon={icons.lock}
              placeholder={"12345"}
              value={verification.code}
              keyboardType="numeric"
              onChangeText={(code) =>
                setVerification({ ...verification, code })
              }
            />
            {verification.error && (
              <Text className="text-red-500 text-sm mt-1">
                {verification.error}
              </Text>
            )}
            <CustomButton
              title="Verify Email"
              onPress={onPressVerify}
              className="mt-5 bg-success-500"
            />
          </View>
        </ReactNativeModal>


        <ReactNativeModal
          isVisible={showSuccessModal}
        >
          <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
            <Image 
              source={images.check}
              className="w-[110px] h-[110px] mx-auto my-5" 
            />
            <Text className="text-3xl font-JakartaBold text-center">
              Verified
            </Text>
            <Text className="text-base text-gray-400 font-Jakarta text-center mt-2">
              You have successfully verified your account.
            </Text>
            <CustomButton
              title="Browse Home"
              onPress={() => {
                setShowSuccessModal(false)
                router.push(`/(root)/(tabs)/home`)
              }}
              className="mt-5"
            />
          </View>
        </ReactNativeModal>

      </View>
    </ScrollView>
  )

}
export default SignUp;
import * as SecureStore from 'expo-secure-store'
import * as  Linking  from 'expo-linking'
import { fetchAPI } from './fetch'


export interface TokenCache {
  getToken: (key: string) => Promise<string | undefined | null>
  saveToken: (key: string, token: string) => Promise<void>
  clearToken?: (key: string) => void
}

export const tokenCache = {
  async getToken(key: string) {
    try {
      const item = await SecureStore.getItemAsync(key)
      if (item) {
        console.log(`${key} was used 🔐 \n`)
      } else {
        console.log('No values stored under key: ' + key)
      }
      return item
    } catch (error) {
      console.error('SecureStore get item error: ', error)
      await SecureStore.deleteItemAsync(key)
      return null
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value)
    } catch (err) {
      return
    }
  },
}

export const googleOAuth = async (startOAuthFlow: any) => {
  try {
    const { createdSessionId, setActive, signUp } = await startOAuthFlow({ // startOauthFlow devuelve una promesa { createdSessionId, setActive, signUp}
      redirectUrl: Linking.createURL("/(root)/(tabs)/home"),               // Si se completa la promesa redirect la url proporcionada.
    });

    if (createdSessionId) {                                                // Si se creo la sessionId
      if (setActive) {                                                     // y se recibio el set de estado de active
        await setActive({ session: createdSessionId });                    // se establece el estado de active con el objeto de la sessionId

        if (signUp.createdUserId) {                                        // Si se recibieron los datos de registro
          await fetchAPI("/(api)/user", {                                  // se crea un usuario en nuestra bd 
            method: "POST",
            body: JSON.stringify({
              name: `${signUp.firstName} ${signUp.lastName}`,
              email: signUp.emailAddress,
              clerkId: signUp.createdUserId,
            }),
          });
        }

        return {
          success: true,
          code: "success",
          message: "You have successfully signed in with Google",
        };
      }
    }

    return {
      success: false,
      message: "An error occurred while signing in with Google",
    };
  } catch (err: any) {
    console.error(err);
    return {
      success: false,
      code: err.code,
      message: err?.errors[0]?.longMessage,
    };
  }
};
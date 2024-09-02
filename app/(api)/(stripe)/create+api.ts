import { Stripe } from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {                                    // Función de API que maneja las solicitudes POST para iniciar el proceso de pago.
  const body = await request.json();                                              
  const { name, email, amount } = body;                                           // Se extraen name, email, y amount del cuerpo de la solicitud.

  if (!name || !email || !amount) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {   // Se verifica que todos estos campos estén presentes.
      status: 400,
    });
  }

  let customer;
  const doesCustomerExist = await stripe.customers.list({                         // Se busca si ya existe un cliente con el email proporcionado.
    email,
  });

  if (doesCustomerExist.data.length > 0) {                                        // Si existe, se usa ese cliente
    customer = doesCustomerExist.data[0];
  } else {
    const newCustomer = await stripe.customers.create({                           // Si no, se crea uno nuevo.
      name,
      email,
    });

    customer = newCustomer;
  }

  const ephemeralKey = await stripe.ephemeralKeys.create(         // Se crea una clave efímera para el cliente, que se usará en el cliente para operaciones temporales.
    { customer: customer.id },
    { apiVersion: "2024-06-20" },
  );

  const paymentIntent = await stripe.paymentIntents.create({      // Se crea una nueva intención de pago con Stripe.
    amount: parseInt(amount) * 100,                               // Se especifica el monto (multiplicado por 100 para convertir a centavos)
    currency: "usd",                                              // La moneda
    customer: customer.id,                                        // y el ID del cliente
    automatic_payment_methods: {                                  // Se habilitan los métodos de pago automáticos y se deshabilitan las redirecciones.
      enabled: true,
      allow_redirects: "never",
    },
  });

  return new Response(                                            // Se devuelve una respuesta con   
    JSON.stringify({
      paymentIntent: paymentIntent,                               // la intención de pago
      ephemeralKey: ephemeralKey,                                 // la clave efímera
      customer: customer.id,                                      // y el ID del cliente  
    }),
  );
}
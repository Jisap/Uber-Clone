import { Stripe } from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {                                          // Maneja las solicitudes POST para confirmar y ejecutar el pago.
  try {
    const body = await request.json();
    const { payment_method_id, payment_intent_id, customer_id, client_secret } = body;  // Se extraen del body el método y la intención de pago, el clienteId y el secret

    if (!payment_method_id || !payment_intent_id || !customer_id) {                     // Se verifica que los campos necesarios estén presentes.
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 },
      );
    }

    const paymentMethod = await stripe.paymentMethods.attach(                 // Se utiliza stripe.paymentMethods.attach() para asociar el método de pago con el cliente en Stripe.
      payment_method_id,
      { customer: customer_id },
    );

    const result = await stripe.paymentIntents.confirm(payment_intent_id, {   // Se usa stripe.paymentIntents.confirm() para confirmar y ejecutar la intención de pago.
      payment_method: paymentMethod.id,                                       // Se pasa el ID del método de pago adjunto en el paso anterior.
    });

    return new Response(  // Si todo es exitoso, se devuelve una respuesta con un mensaje de éxito y el resultado de la confirmación del pago.
      JSON.stringify({
        success: true,
        message: "Payment successful",
        result: result,
      }),
    );
  } catch (error) {
    console.error("Error paying:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
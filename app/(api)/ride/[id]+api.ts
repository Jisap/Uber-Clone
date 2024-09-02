import { neon } from "@neondatabase/serverless";

export async function GET(request: Request, { id }: { id: string }) {               // Maneja las solicitudes GET para obtener el historial de viajes de un usuario específico.
  if (!id)                                                                          // Se verifica que se haya proporcionado un ID de usuario.  
    return Response.json({ error: "Missing required fields" }, { status: 400 });

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);            // Se crea una conexión a la base de datos Neon usando la URL almacenada en las variables de entorno.

    // Se ejecuta una consulta SQL compleja que :
    // 1º Selecciona todos los detalles relevantes de la tabla rides 
    // 2º Hace un JOIN con la tabla drivers para obtener información del conductor
    // 3º Construye un objeto JSON con la información del conductor usando json_build_object
    // 4º Filtra los viajes por el ID de usuario proporcionado.
    // 5º Ordena los resultados por fecha de creación en orden descendente (más recientes primero).

    const response = await sql`
        SELECT
            rides.ride_id,
            rides.origin_address,
            rides.destination_address,
            rides.origin_latitude,
            rides.origin_longitude,
            rides.destination_latitude,
            rides.destination_longitude,
            rides.ride_time,
            rides.fare_price,
            rides.payment_status,
            rides.created_at,
            'driver', json_build_object(
                'driver_id', drivers.id,
                'first_name', drivers.first_name,
                'last_name', drivers.last_name,
                'profile_image_url', drivers.profile_image_url,
                'car_image_url', drivers.car_image_url,
                'car_seats', drivers.car_seats,
                'rating', drivers.rating
            ) AS driver 
        FROM 
            rides
        INNER JOIN
            drivers ON rides.driver_id = drivers.id
        WHERE 
            rides.user_id = ${id}
        ORDER BY 
            rides.created_at DESC;
    `;

    return Response.json({ data: response });
  } catch (error) {
    console.error("Error fetching recent rides:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
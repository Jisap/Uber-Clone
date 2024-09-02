import { neon } from "@neondatabase/serverless"; // cliente SQL para trabajar con Neon, una base de datos PostgreSQL serverless.

export async function POST(request: Request) {   // Maneja las solicitudes POST para crear un nuevo registro de viaje en la base de datos. 
  try {
    const body = await request.json();           // Se extraen todos los campos necesarios del cuerpo de la solicitud. 
    const {
      origin_address,
      destination_address,
      origin_latitude,
      origin_longitude,
      destination_latitude,
      destination_longitude,
      ride_time,
      fare_price,
      payment_status,
      driver_id,
      user_id,
    } = body;

    if (                                         // Se verifica que todos los campos requeridos estén presentes. 
      !origin_address ||
      !destination_address ||
      !origin_latitude ||
      !origin_longitude ||
      !destination_latitude ||
      !destination_longitude ||
      !ride_time ||
      !fare_price ||
      !payment_status ||
      !driver_id ||
      !user_id
    ) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const sql = neon(`${process.env.DATABASE_URL}`);  // Se crea una conexión a la base de datos Neon usando la URL de la base de datos almacenada en las variables de entorno.

    // Se ejecuta una consulta SQL para insertar un nuevo registro en la tabla rides
    const response = await sql`                       
      INSERT INTO rides ( 
          origin_address, 
          destination_address, 
          origin_latitude, 
          origin_longitude, 
          destination_latitude, 
          destination_longitude, 
          ride_time, 
          fare_price, 
          payment_status, 
          driver_id, 
          user_id
      ) VALUES (
          ${origin_address},
          ${destination_address},
          ${origin_latitude},
          ${origin_longitude},
          ${destination_latitude},
          ${destination_longitude},
          ${ride_time},
          ${fare_price},
          ${payment_status},
          ${driver_id},
          ${user_id}
      )
      RETURNING *;
    `;

    return Response.json({ data: response[0] }, { status: 201 }); // Si la inserción es exitosa, se devuelve el primer (y único) registro insertado con un estado 201 (Created).
  } catch (error) {
    console.error("Error inserting data into recent_rides:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
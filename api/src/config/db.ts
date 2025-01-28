import postgres from 'postgres'
import dotenv from 'dotenv'

dotenv.config()

console.log('Attempting database connection with URI:', process.env.DATABASE_URI?.replace(/:.*@/, ':****@')) // Safely log URL

const sql = postgres(process.env.DATABASE_URI as string, {
  onnotice: () => {}, // Suppress notice messages
  onparameter: () => {}, // Suppress parameter messages
  debug: (connection, query, params) => {
    console.log('SQL Query:', query)
    console.log('Parameters:', params)
  },
})

// Test the connection
sql`SELECT 1`.then(() => {
  console.log('Database connection successful')
}).catch(err => {
  console.error('Database connection failed:', err)
})

export default sql
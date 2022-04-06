const pg = require('pg')

const pool = new pg.Pool({
    host: 'localhost',
    port:5432,
    user: 'postgres',
    password: '2003',
    database: 'taxi'
})

const data =  async(query, ...params) => {
    
        const client = await pool.connect()
        try {
            const { rows } = await client.query(query, params.length ? params : null)
            return rows
        } catch(error){
            console.log('database error: ',error)
        } finally {
            client.release()
        }
}


module.exports = {
    data
}
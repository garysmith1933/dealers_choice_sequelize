const Sequelize = require("sequelize") 
const sequelize = new Sequelize(process.env.DATABASE_URL || "postgres://localhost/favorite_games_db")
const { STRING } = Sequelize

// make tables

const VideoGames = sequelize.define("game", {
    name: {
        type: STRING,
        unique: true,
        allowNull: false,
        validate: {
            notEmpty: true
        }
        
    }
    
})


const Gamers = sequelize.define("person", {
    name: {
        type: STRING,
        unique: true,
        allowNull: false,
        validate: {
            notEmpty: true
        }
        
    }

})

Gamers.belongsTo(VideoGames)
VideoGames.hasMany(Gamers)


// express

const express = require("express")
const app = express()
app.use(express.urlencoded({ extended: false}))


app.get('/', (req, res) => res.redirect('/videogames'))

app.get('/videogames', async(req,res,next) => {
    try {
         const games = await VideoGames.findAll({
            include: [ Gamers ]
        })
        
        const gamers = await Gamers.findAll()
    
    const html = games.map( game => {
        return `
        <div> ${game.name}: <a href = '/videogames/${game.id}'> Who likes this game? </a> </div>
        `
    }).join('')
    
    
     const listOFGamers = gamers.map( person => {
        return `
        <div> ${person.name}</div>
        `
    }).join('')
    

    res.send(`
    <html> 
    <head>
    <title> Our Favorite Games </title>
    </head>
    
    <body>
    <h1>Our Favorite Games</h1> 
    
    ${ html }
    
    <h2> The Crew </h2>
    ${listOFGamers}
    
    <body>
    </html>
    `)
        
    } catch(err) {
        next(err)
    }

})


app.get('/videogames/:id', async(req, res, next) => {
      try {
        const games = await VideoGames.findByPk(req.params.id, {
            include: [ Gamers ]
        })
        
       
        
        
        const html = games.people.map( person => {
            return ` <li> ${ person.name } 
            </li> `
        }).join('')
        
       res.send(`
    <html> 
    <head>
    <title> Our Favorite Games </title>
    </head>
    
    <body>
    <h1>${games.name}</h1>
    <a href = '/videogames'> Back </a>
    
    ${ html }
    
    <body>
    </html>
    `)
     
    }  
        
    catch (err) {
        next(err)
    }

    
   
})

const start = async() => {
    try {
   await sequelize.sync({force: true})
   console.log("starting")
   
   
    const persona5 = await VideoGames.create({ name: "Persona 5"});
  const smashBros = await VideoGames.create({ name: "Smash Bros"});
  const xenoblade = await VideoGames.create({ name: "Xenoblade chronicles"});
  const pokemon = await VideoGames.create({ name: "Pokemon"});

  
  
   const Gary = await Gamers.create({name: "Gary", gameId: persona5.id})
   const Josh = await Gamers.create({name: "Josh",  gameId: xenoblade.id})
   const Gavin = await Gamers.create({name: "Gavin",  gameId: pokemon.id})
   const Steve = await Gamers.create({name: "Steve", gameId: smashBros.id}) 
    const Katlin = await Gamers.create({name: "Katlin", gameId: pokemon.id}) 
     const Jackie = await Gamers.create({name: "Jackie", gameId: pokemon.id}) 
// need id
  
  

  
   
   
  
   
   
  
  const port = process.env.PORT || 8080;
  
  app.listen(port, ()=> console.log(`listening on port ${port}`))

   
    }   catch(err) {
        console.log(err)
    }
}

start()
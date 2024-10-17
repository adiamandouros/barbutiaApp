import express from 'express'
import { engine } from 'express-handlebars'
import { router } from './routes.mjs'

const app = express()

app.engine('hbs', engine({extname: ".hbs"}))
app.set('view engine', 'hbs')

app.use(express.static("content"))

//middleware gia na diavazei to request body
app.use(express.urlencoded({extended: false}))

app.use("/", router)

app.use((req, res) => {
    res.redirect("/")
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => console.log("App has started in port " + PORT))
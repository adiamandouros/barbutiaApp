import axios from 'axios'

class PageScraper {
    constructor(url){
        this.url = url
    }

    async initialize(){
        try{
            const response = await axios.get(this.url)
            this.data = response.data
            // console.log("GOT DATA!")
        }catch(error){
            console.error("Problem during data fetch!")
            console.error(error)
            this.data=null
        }
    }

    printData(){
        if(this.data) console.log(this.data)
        else console.log("Data not found")
    }

    getData(){
        if(this.data) return this.data
        else console.log("Data not found")
    }

    getDataJSON(){
        if(this.data) return JSON.stringify(this.data)
        else console.log("Data not found")
    }


}

export {PageScraper}
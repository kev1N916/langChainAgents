import cron from 'node-cron';

// console.log(cron.validate('0 12 * * *')); // true

class CronService {
    constructor (){
    }

    public schedule(id:string){
        const task=cron.schedule('5 * * * * *',()=>{
            console.log("hello")
        },{
            name:id,
        })
        task.on("task:stopped",()=>{
            
        })
        console.log(task)
    }
}

const cronService= new CronService()
cronService.schedule('task1')
// const task=cronService.schedule()
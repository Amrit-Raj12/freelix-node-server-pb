import * as JobSchedular from 'node-schedule'

export class Email {
    static runEmailJobs(){
        this.sendEmailJob();
    }

    static sendEmailJob(){
        JobSchedular.scheduleJob('send email job', '43 * * * *', () => {
            console.log('Email Job Scheduled')
        })
    }
}
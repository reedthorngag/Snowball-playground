import Route from "../types/route";

const ping:Route = ['/ping','GET','none', (req:any,res:any) => res.status(200).send('pong!')];


const routeList:Route[] = [
    ping
]

export default routeList;


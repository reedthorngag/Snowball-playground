import Route from "../types/route";
import logger from "../util/logger";

const fetch_post = ['/fetch/post', 'GET', 'optional', async (req:any,res:any) => {
    
    if (!req.query.id) {
        res.status(404).send('missing post id parameter ("id")');
        return;
    }

    const post = await prismaClient.post.findUnique({
        where: {
            PostID:(await prismaClient.post.findFirst())!.PostID,//req.query.id,
            IsDeleted:false
        },
        select: {
            Title:true,
            Community:true,
            Type:true,
            Url:true,
            Body:true,
            Rating:true,
            Author:true,
            LastEdited:true,
            IsLocked:true,
            PostedAt:true
        }
    });

    logger.info(JSON.stringify(post));

    res.status(200).send();

}];

const routeList:Route[] = [
];

export default routeList;
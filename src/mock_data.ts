import bcrypt from 'bcrypt';
import logger from './util/logger';

const start = new Date();
const passwordHash = bcrypt.hashSync('Password123',12); // took ~183ms on a ryzen7 4800H @ 2.9GHz
const end = new Date();
logger.info(`Time to hash: ${end.getMilliseconds()-start.getMilliseconds()}ms`); // yes, this is sometimes negative, I'm lazy

export default function () {

    (async () => {

        await prismaClient.loginInfo.deleteMany();
        await prismaClient.user.deleteMany();
        for (let i=100;i--;)
            await prismaClient.user.create({
                data: {
                    Name: "testUser_"+i,
                    IsAdmin: false
                }
            })

        logger.info((await prismaClient.user.findFirst())?.UserID)
        logger.info(JSON.stringify(await prismaClient.loginInfo.create({
            data: {
                Email:'admin',
                Password:passwordHash,
                IsAdmin:true,
                UserID: (await prismaClient.user.findFirst())?.UserID
            }
        })));
        await prismaClient.loginInfo.create({
            data: {
                Email:'testuser',
                Password:passwordHash,
                IsAdmin: false,
                UserID: (await prismaClient.user.findMany())[1]?.UserID
            }
        });
        logger.warn(JSON.stringify(await prismaClient.loginInfo.findFirst()));
        logger.warn(JSON.stringify(await prismaClient.user.findFirst()));
    })();
}



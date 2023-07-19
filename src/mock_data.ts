import bcrypt from 'bcrypt';
import logger from './util/logger';

const start = new Date();
const passwordHash = bcrypt.hashSync('Password123',12); // took ~183ms on a ryzen7 4800H @ 2.9GHz
const end = new Date();
logger.info(`Time to hash: ${end.getMilliseconds()-start.getMilliseconds()}ms`); // yes, this is sometimes negative, I'm lazy

export default function () {

    (async () => {

        logger.info('Loading mock data...')

        await prismaClient.loginInfo.deleteMany();
        await prismaClient.user.deleteMany();
        for (let i=100;i--;)
            await prismaClient.user.create({
                data: {
                    Name: "testUser_"+i,
                    DisplayName: "<h1>testUser</h1>_"+i,
                    Bio: "<h1>test</h1>",
                    IsAdmin: false
                }
            })

        await prismaClient.loginInfo.create({
            data: {
                Email:'admin',
                Password:passwordHash,
                IsAdmin:true,
                UserID: (await prismaClient.user.findFirst())?.UserID
            }
        });
        await prismaClient.loginInfo.create({
            data: {
                Email:'testuser',
                Password:passwordHash,
                IsAdmin: false,
                UserID: (await prismaClient.user.findMany())[1]?.UserID
            }
        });
        await prismaClient.loginInfo.create({
            data: {
                Email:'<h1>testuser</h1>',
                Password:passwordHash,
                IsAdmin: false,
                UserID: (await prismaClient.user.findMany())[2]?.UserID
            }
        });

        logger.info('Loaded mock data!')
    })();
}



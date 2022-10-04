const TelegramBot = require('node-telegram-bot-api')
const express = require('express')
const cors = require('cors');
const { query } = require('express');


const token = '5468176574:AAFibvXDplXYA8pngD19QZSLfG7uarf8CIY';
const webAppUrl = "https://effervescent-sable-4590dc.netlify.app";

const bot = new TelegramBot(token, { polling: true });
const app = express();

app.use(express.json());
app.use(cors());

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {
        await bot.sendMessage(chatId, "Fill the form below", {
            reply_markup: {
                keyboard: [
                    [{ text: 'Fill the from', web_app: { url: webAppUrl + '/form' } }]
                ]
            }
        })

        await bot.sendMessage(chatId, "Enter our shop by pressing the button below!", {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Make an order', web_app: { url: webAppUrl } }]
                ]
            }
        })
    }

    if (msg?.web_app_data?.data) {
        try {
            const data = JSON.parse(msg?.web_app_data?.data)

            await bot.sendMessage(chatId, 'Thank you for request!')
            await bot.sendMessage(chatId, 'Your country: ' + data?.country)
            await bot.sendMessage(chatId, 'Your street: ' + data?.street)

            setTimeout(async () => {
                await bot.sendMessage(chatId, 'All info you will get in this chat!')
            }, 3000)
        } catch (e) {
            console.log(e);
        }
    }
})
app.post('/web-data', async (req, res) => {
    const { queryId, products, totalPrice } = req.body;
    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Successful purchase',
            input_message_content: {
                message_text: 'Thank you for the purchase, you have purchased goods worth $' + totalPrice
            }
        })
        return res.status(200).json({});
    } catch (e) {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Unsuccessful purchase',
            input_message_content: {
                message_text: 'Something went wrong, unsuccessful purchase'
            }
        })
        return res.status(500).json({});
    }

})
const PORT = 8000;
app.listen(PORT, () => console.log('server started on port ' + PORT))
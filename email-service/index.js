const amqp = require('amqplib');
const nodemailer = require('nodemailer');

// 1. Настройки за личен Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ecoswap@gmail.com',
        pass: 'lydf dxri lqog zglp'
    }
});

async function start() {
    const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://127.0.0.1';
    let connection;

    // 1. Повтаряме опитите за свързване, докато успеем
    while (!connection) {
        try {
            console.log(`[~] Опит за свързване с RabbitMQ на ${rabbitUrl}...`);
            connection = await amqp.connect(rabbitUrl);
            console.log("[✔] Успешна връзка с RabbitMQ!");
        } catch (error) {
            console.error("[!] RabbitMQ все още не е готов. Нов опит след 5 секунди...");
            // Изчакваме 5 секунди преди следващия опит
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }

    // 2. След като имаме връзка, продължаваме напред
    try {
        const channel = await connection.createChannel();
        const queue = 'email_queue';

        await channel.assertQueue(queue, { durable: true });
        console.log(`[*] Сървисът е вдигнат! Чакам за имейли в опашката: ${queue}...`);

        // 3. Слушаме за нови съобщения
        channel.consume(queue, async (msg) => {
            if (msg !== null) {
                try {
                    let content = msg.content.toString();
                    console.log(`[x] ПРИСТИГНА CONTENT: ${content}`);

                    let data = JSON.parse(content);

                    // Презастраховане, ако данните са стрингифицирани два пъти
                    if (typeof data === 'string') {
                        data = JSON.parse(data);
                    }

                    const recipient = data.targetEmail || data.email;
                    console.log(`[x] Опит за пращане до: ${recipient}`);

                    if (!recipient) {
                        console.error("[!] Грешка: Липсва имейл в данните!");
                        channel.ack(msg);
                        return;
                    }

                    const mailOptions = {
                        from: 'pennywiseaibest@gmail.com',
                        to: recipient,
                        subject: data.title || "Inventory Notification",
                        text: data.message || "No message content"
                    };

                    await transporter.sendMail(mailOptions);
                    console.log(`[✔] УСПЕХ! Имейлът е изпратен на ${recipient}! 🚀`);

                    channel.ack(msg);
                } catch (error) {
                    console.error(`[!] Грешка при изпращане на имейл:`, error);
                    // Важно: Потвърждаваме съобщението дори при грешка в имейла,
                    // за да не блокираме опашката (освен ако не искаш да се препрати)
                    channel.ack(msg);
                }
            }
        });
    } catch (error) {
        console.error('Грешка при създаване на канал:', error);
    }
}

start();
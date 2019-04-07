const fs = require('fs');
const path = require('path');
const phin = require('phin');
const cheerio = require('cheerio');

const outputDir = process.env.OUTPUT_DIR || path.join(process.cwd(), 'output');

(async () => {
    // phin is extremely simple to use. Just throw in a URL and get a response back via promise.
    let res = await phin('https://en.wikipedia.org/wiki/List_of_Emperors_of_Japan');
    
    let $ = cheerio.load(res.body);

    const emperors = $('.wikitable tr td:nth-child(3)').get().map((e) => $(e).text().trim());
    console.log(`Emperors of Japan`, JSON.stringify(emperors, null, 4));

    // POSTing is straightforward
    res = await phin({
        url: 'https://postman-echo.com/post',
        method: 'POST',  
        form: {
            'hello': 'dolly'
        },
        // We can ask to get parsed JSON back.
        parse: 'json'
    });

    console.log(`Form: `, JSON.stringify(res.body.form, null, 4));

    $ = cheerio.load((await phin('https://en.wikipedia.org/wiki/Wikipedia:Picture_of_the_day')).body);
    
    const imageUrl = 'https://'+$('#bodyContent a.image img').first().attr('src');
    
    const stream = await phin({
        url: imageUrl,
        // You can ask for a stream in place of 'res.body'.
        stream: true
    });

    stream.pipe(fs.createWriteStream(path.join(outputDir, 'potd.jpg')));
})();
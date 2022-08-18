export const getFilledTemplate = ({ code }: { code: string }) => {
  return {
    // Subject of the message
    subject: 'You register code for Foxy!',

    // plaintext body
    text: `Your confirmation code is: ${code} \n\nIf it wasn't you, just ignore this mail. Your data is safe.`,

    // HTML body
    html: `<div id='email' class='w-full' style='font-family: sans-serif'>
        <div style='
            background: #1e1e1e;
            width: 100%;
            display: flex;
            height: 8rem;
            align-items: center;
            justify-content: center;
          '>
          <img src='cid:logo@talkiiing.ru' style='height: 4rem'>
        </div>
        <div style='
            padding: 2rem;
            margin: 1rem;
            background: #f0f0f0;
            min-height: 8rem;
          '>
          <p>Your confirmation code is:</p>
          <pre style='
              margin-top: 0.5rem;
              padding: 0.5rem;
              font-weight: bold;
              font-size: 2rem;
            '>${code}</pre>
          <p style='margin-top: 2rem; font-size: 0.75rem; color: #555'>
            If it wasn't you, just ignore this mail. Your data is safe.
          </p>
        </div>
      </div>`,

    attachments: [
      {
        filename: 'image.png',
        content: Buffer.from(
          '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',
          'base64',
        ),

        cid: 'logo@talkiiing.ru', // should be as unique as possible
      },
    ],
  }
}

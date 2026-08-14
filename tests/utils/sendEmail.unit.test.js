describe('sendEmail utility', () => {
  beforeEach(() => {
    jest.resetModules();
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_FROM;
  });

  test('falls back to console when no SMTP configured', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    const sendEmail = require('../../utils/sendEmail');
    await sendEmail({ to: 'a@b.com', subject: 's', html: '<p>x</p>' });
    expect(log).toHaveBeenCalled();
    log.mockRestore();
  });

  test('uses nodemailer when SMTP config present', async () => {
    // Mock nodemailer transport
    jest.doMock('nodemailer', () => ({
      createTransport: jest.fn(() => ({ sendMail: jest.fn().mockResolvedValue({ messageId: 'm1' }) })),
    }));
    process.env.SMTP_HOST = 'host';
    process.env.SMTP_FROM = 'from@x.com';
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    const sendEmail = require('../../utils/sendEmail');
    const info = await sendEmail({ to: 'a@b.com', subject: 's', html: '<p>x</p>' });
    expect(info).toBeDefined();
    expect(log).toHaveBeenCalled();
    log.mockRestore();
  });
});

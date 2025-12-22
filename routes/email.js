const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// 메모리에 임시 저장 (프로덕션에서는 Redis 등 사용)
const verificationCodes = new Map();

// 이메일 전송 설정 (Gmail 예시)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// 인증 코드 생성
const generateVerificationCode = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// 이메일 인증 코드 발송
router.post('/send-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: '이메일을 입력하세요.' });
    }

    // 인증 코드 생성
    const code = generateVerificationCode();
    
    // 5분간 유효
    verificationCodes.set(email, {
      code,
      expiresAt: Date.now() + 5 * 60 * 1000
    });

    // 개발 환경에서는 이메일 전송 대신 콘솔에 출력
    if (process.env.NODE_ENV === 'development' || !process.env.EMAIL_USER) {
      console.log(`\n📧 이메일 인증 코드 (${email}): ${code}\n`);
      return res.json({ 
        message: '인증 코드가 발송되었습니다.',
        // 개발 환경에서만 코드 반환
        devCode: code
      });
    }

    // 프로덕션: 실제 이메일 전송
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: '커뮤니티 게시판 이메일 인증',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">이메일 인증</h2>
          <p>안녕하세요!</p>
          <p>커뮤니티 게시판 회원가입을 위한 인증 코드입니다.</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h1 style="color: #667eea; margin: 0; font-size: 32px; letter-spacing: 5px;">${code}</h1>
          </div>
          <p style="color: #666; font-size: 14px;">이 코드는 5분간 유효합니다.</p>
          <p style="color: #666; font-size: 14px;">본인이 요청하지 않았다면 이 이메일을 무시하세요.</p>
        </div>
      `
    });

    res.json({ message: '인증 코드가 이메일로 발송되었습니다.' });
  } catch (error) {
    console.error('이메일 전송 오류:', error);
    res.status(500).json({ error: '이메일 전송에 실패했습니다.' });
  }
});

// 인증 코드 확인
router.post('/verify-code', (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: '이메일과 인증 코드를 입력하세요.' });
    }

    const stored = verificationCodes.get(email);

    if (!stored) {
      return res.status(400).json({ error: '인증 코드를 먼저 요청하세요.' });
    }

    if (Date.now() > stored.expiresAt) {
      verificationCodes.delete(email);
      return res.status(400).json({ error: '인증 코드가 만료되었습니다.' });
    }

    if (stored.code !== code) {
      return res.status(400).json({ error: '인증 코드가 일치하지 않습니다.' });
    }

    // 인증 성공 - 코드 삭제
    verificationCodes.delete(email);

    res.json({ message: '이메일 인증이 완료되었습니다.' });
  } catch (error) {
    console.error('인증 확인 오류:', error);
    res.status(500).json({ error: '인증 확인에 실패했습니다.' });
  }
});

module.exports = router;

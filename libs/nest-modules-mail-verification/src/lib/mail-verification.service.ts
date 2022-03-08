import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { MailVerificationCode, Prisma, PrismaPromise } from '@prisma/client';
import { PrismaService } from '@project-lc/prisma-orm';
import { getMailerHost } from '@project-lc/utils';
import { nanoid } from 'nanoid';
import { map, Observable } from 'rxjs';

@Injectable()
export class MailVerificationService {
  private MAILER_HOST: string = getMailerHost();

  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * 이메일 인증 코드를 생성합니다.
   * @param target 타겟 이메일 주소
   * @returns 생성된 이메일 인증 코드
   */
  private async createEmailCode(target: string): Promise<string> {
    const code = nanoid(6);
    await this.prisma.mailVerificationCode.create({
      data: {
        email: target,
        verificationCode: code,
      },
    });
    return code;
  }

  /**
   * 이메일 인증을 위해, 인증코드를 포함한 메일을 타겟 이메일에 보냅니다.
   * @returns {boolean} 성공여부 or 500 에러
   */
  public async sendVerificationMail(targetEmail: string): Promise<Observable<boolean>> {
    const code = await this.createEmailCode(targetEmail);

    return this.httpService
      .post<boolean>(`${this.MAILER_HOST}/mail-verification`, {
        targetEmail,
        code,
      })
      .pipe(map((res) => res.data));
  }

  /**
   * 주어진 이메일과 인증코드가 실제 존재하는 지 체크합니다.
   * @param input Partial<{email: string; id: number}>
   */
  public async checkMailVerification(
    email: string,
    code: string,
  ): Promise<MailVerificationCode> {
    const targetTime = new Date();
    targetTime.setMinutes(targetTime.getMinutes() - 10);
    const row = await this.prisma.mailVerificationCode.findFirst({
      orderBy: { createDate: 'desc' },
      where: {
        email,
        createDate: {
          gt: targetTime,
        },
      },
    });

    if (row?.verificationCode === code) {
      return row;
    }
    return null;
  }

  /**
   * 메일인증을 삭제합니다. 회원가입이 완료된 이후 진행하여야 합니다.
   * @param id 삭제할 메일 인증의 고유 아이디
   */
  public deleteSuccessedMailVerification(
    email: MailVerificationCode['email'],
  ): PrismaPromise<Prisma.BatchPayload> {
    return this.prisma.mailVerificationCode.deleteMany({ where: { email } });
  }
}

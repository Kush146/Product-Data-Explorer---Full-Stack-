import { Injectable } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class HistoryService {
  constructor(private prisma: PrismaService) {}

  
 
  save(dto: { sessionId: string; pathJson: unknown }) {
  return this.prisma.viewHistory.create({
    data: {
      sessionId: dto.sessionId,
      pathJson: dto.pathJson as any, // or Prisma.InputJsonValue
    },
  });
}


  list(sessionId: string) {
    return this.prisma.viewHistory.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}


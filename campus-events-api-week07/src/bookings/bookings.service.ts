import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Booking } from '../generated/prisma/client.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Booking[]> {
    return this.prisma.booking.findMany({ orderBy: { createdAt: 'desc' } });
  }

  create(eventId: number, dto: CreateBookingDto): Promise<Booking> {
    return this.prisma.$transaction(async (tx) => {
      const event = await tx.event.findUnique({ where: { id: eventId } });
      if (!event) throw new NotFoundException(`Event ${eventId} not found`);

      const left = event.capacity - event.booked;
      const updated = await tx.event.updateMany({
        where: {
          id: eventId,
          booked: { lte: event.capacity - dto.seats },
        },
        data: { booked: { increment: dto.seats } },
      });

      if (updated.count === 0) {
        const current = await tx.event.findUnique({
          where: { id: eventId },
          select: { capacity: true, booked: true },
        });
        const currentLeft = current ? current.capacity - current.booked : left;
        throw new ConflictException(`Only ${currentLeft} seat(s) left`);
      }

      return tx.booking.create({ data: { ...dto, eventId } });
    });
  }

  async remove(id: number): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({ where: { id } });
      if (!booking) throw new NotFoundException(`Booking ${id} not found`);

      await tx.booking.delete({ where: { id } });
      await tx.event.update({
        where: { id: booking.eventId },
        data: { booked: { decrement: booking.seats } },
      });
    });
  }
}

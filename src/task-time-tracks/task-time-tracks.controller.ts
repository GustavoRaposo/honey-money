import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { TaskTimeTrackResponseDto } from './dto/task-time-track-response.dto.js';
import { TaskTimeTracksService } from './task-time-tracks.service.js';

@ApiTags('task-time-tracks')
@Controller('tasks/:taskId/time-tracks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TaskTimeTracksController {
  constructor(private readonly service: TaskTimeTracksService) {}

  @Post('start')
  @ApiOperation({ summary: 'Iniciar rastreamento de tempo em uma tarefa' })
  async start(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Request() req: { user: { id: number } },
  ): Promise<TaskTimeTrackResponseDto> {
    return this.service.start(taskId, req.user.id);
  }

  @Patch(':id/stop')
  @ApiOperation({ summary: 'Pausar rastreamento de tempo' })
  async stop(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { id: number } },
  ): Promise<TaskTimeTrackResponseDto> {
    return this.service.stop(taskId, id, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os rastreamentos de uma tarefa' })
  async findAll(
    @Param('taskId', ParseIntPipe) taskId: number,
  ): Promise<TaskTimeTrackResponseDto[]> {
    return this.service.findAll(taskId);
  }
}

import { Module } from '@nestjs/common';
import { TasksModule } from '../tasks/tasks.module.js';
import { TaskTimeTracksController } from './task-time-tracks.controller.js';
import { TaskTimeTracksRepository } from './task-time-tracks.repository.js';
import { TaskTimeTracksService } from './task-time-tracks.service.js';

@Module({
  imports: [TasksModule],
  controllers: [TaskTimeTracksController],
  providers: [TaskTimeTracksService, TaskTimeTracksRepository],
})
export class TaskTimeTracksModule {}

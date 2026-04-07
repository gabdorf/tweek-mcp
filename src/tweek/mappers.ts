/**
 * Mappers for transforming Tweek API responses to internal types
 */

import type {
  Calendar,
  CalendarListResponse,
  CreateTaskRequest,
  CustomColor,
  CustomColorsResponse,
  Task,
  TaskListResponse,
  TaskPatch,
  TweekApiCalendar,
  TweekApiCustomColor,
  TweekApiTask,
  TweekApiTaskListResponse,
} from './types.js'
import {
  CalendarRole,
  TaskFrequency,
} from './types.js'

/**
 * Maps raw API role string to stable CalendarRole enum
 */
function mapCalendarRole(apiRole: string): CalendarRole {
  switch (apiRole.toUpperCase()) {
    case 'OWNER':
    case 'ROLE_OWNER':
      return CalendarRole.ROLE_OWNER
    case 'EDITOR':
    case 'ROLE_EDITOR':
      return CalendarRole.ROLE_EDITOR
    case 'VIEWER':
    case 'ROLE_VIEWER':
      return CalendarRole.ROLE_VIEWER
    default:
      // Default to viewer for unknown roles to be safe
      return CalendarRole.ROLE_VIEWER
  }
}

/**
 * Maps raw API frequency number to TaskFrequency enum
 */
function mapTaskFrequency(apiFreq?: number): TaskFrequency | undefined {
  if (apiFreq === undefined || apiFreq === null) {
    return undefined
  }

  // Validate frequency is in valid range (0-7)
  if (apiFreq < 0 || apiFreq > 7 || !Number.isInteger(apiFreq)) {
    return TaskFrequency.NONE
  }

  return apiFreq as TaskFrequency
}

/**
 * Maps a Tweek API calendar to internal Calendar type
 */
export function mapCalendar(apiCalendar: TweekApiCalendar): Calendar {
  return {
    id: apiCalendar.id,
    name: apiCalendar.name,
    role: mapCalendarRole(apiCalendar.role),
    color: apiCalendar.color,
    description: apiCalendar.description,
  }
}

/**
 * Maps a Tweek API task to internal Task type
 */
export function mapTask(apiTask: TweekApiTask): Task {
  return {
    id: apiTask.id,
    calendarId: apiTask.calendarId,
    title: apiTask.text,
    description: apiTask.note,
    completed: apiTask.done ?? false,
    date: apiTask.date,
    isoDate: apiTask.isoDate,
    dtStart: apiTask.dtStart,
    notifyAt: apiTask.notifyAt,
    freq: mapTaskFrequency(apiTask.freq),
    checklist: apiTask.checklist?.map(item => ({
      text: item.text,
      completed: item.done,
    })),
    color: apiTask.color,
  }
}

/**
 * Maps a Tweek API custom color to internal CustomColor type
 */
export function mapCustomColor(apiColor: TweekApiCustomColor): CustomColor {
  return {
    id: apiColor.id,
    name: apiColor.name,
    hex: apiColor.hex,
    userId: apiColor.userId,
  }
}

/**
 * Maps a calendar list response from the API
 */
export function mapCalendarListResponse(apiCalendars: TweekApiCalendar[]): CalendarListResponse {
  return {
    calendars: apiCalendars.map(mapCalendar),
  }
}

/**
 * Maps a task list response from the API
 */
export function mapTaskListResponse(apiResponse: TweekApiTaskListResponse): TaskListResponse {
  return {
    pageSize: apiResponse.pageSize,
    nextDocId: apiResponse.nextDocId,
    data: apiResponse.data.map(mapTask),
  }
}

/**
 * Maps a custom colors response from the API
 */
export function mapCustomColorsResponse(apiResponse: { colors: TweekApiCustomColor[] }): CustomColorsResponse {
  return {
    colors: apiResponse.colors.map(mapCustomColor),
  }
}

/**
 * Maps a CreateTaskRequest to the format expected by the Tweek API
 */
export function mapCreateTaskToApi(task: CreateTaskRequest): Record<string, unknown> {
  const apiTask: Record<string, unknown> = {
    calendarId: task.calendarId,
    text: task.title, // MCP uses 'title', API expects 'text'
    done: task.completed ?? false, // API requires 'done' field, default to false
    gcal: false, // API requires 'gcal' field, this is not a Google Calendar task
  }

  if (task.description !== undefined) {
    apiTask.note = task.description // MCP uses 'description', API expects 'note'
  }
  if (task.date !== undefined) {
    apiTask.date = task.date
  }
  if (task.isoDate !== undefined) {
    apiTask.isoDate = task.isoDate
  }
  if (task.dtStart !== undefined) {
    apiTask.dtStart = task.dtStart
  }
  if (task.notifyAt !== undefined) {
    apiTask.notifyAt = task.notifyAt
  }
  if (task.freq !== undefined) {
    apiTask.freq = task.freq
  }
  if (task.checklist !== undefined) {
    apiTask.checklist = task.checklist.map(item => ({
      text: item.text,
      done: item.completed, // MCP uses 'completed', API expects 'done'
    }))
  }
  if (task.priority !== undefined) {
    apiTask.priority = task.priority
  }
  if (task.tags !== undefined) {
    apiTask.tags = task.tags
  }
  if (task.color !== undefined) {
    apiTask.color = task.color
  }

  return apiTask
}

/**
 * Maps a TaskPatch to the format expected by the Tweek API
 */
export function mapTaskPatchToApi(patch: TaskPatch): Record<string, unknown> {
  const apiPatch: Record<string, unknown> = {}

  if (patch.title !== undefined) {
    apiPatch.text = patch.title // MCP uses 'title', API expects 'text'
  }
  if (patch.description !== undefined) {
    apiPatch.note = patch.description // MCP uses 'description', API expects 'note'
  }
  if (patch.completed !== undefined) {
    apiPatch.done = patch.completed // MCP uses 'completed', API expects 'done'
  }
  if (patch.date !== undefined) {
    apiPatch.date = patch.date
  }
  if (patch.isoDate !== undefined) {
    apiPatch.isoDate = patch.isoDate
  }
  if (patch.dtStart !== undefined) {
    apiPatch.dtStart = patch.dtStart
  }
  if (patch.notifyAt !== undefined) {
    apiPatch.notifyAt = patch.notifyAt
  }
  if (patch.freq !== undefined) {
    apiPatch.freq = patch.freq
  }
  if (patch.checklist !== undefined) {
    apiPatch.checklist = patch.checklist.map(item => ({
      text: item.text,
      done: item.completed, // MCP uses 'completed', API expects 'done'
    }))
  }
  if (patch.priority !== undefined) {
    apiPatch.priority = patch.priority
  }
  if (patch.tags !== undefined) {
    apiPatch.tags = patch.tags
  }
  if (patch.color !== undefined) {
    apiPatch.color = patch.color
  }

  return apiPatch
}

/**
 * Validates that a response has the expected structure
 */
export function validateApiResponse<T>(response: unknown, requiredFields: string[]): response is T {
  if (response == null || typeof response !== 'object') {
    return false
  }

  const obj = response as Record<string, unknown>
  return requiredFields.every(field => Object.prototype.hasOwnProperty.call(obj, field))
}

/**
 * Type guard for calendar list response
 */
export function isCalendarListResponse(response: unknown): response is TweekApiCalendar[] {
  return Array.isArray(response)
    && (response.length === 0 || validateApiResponse(response[0], ['id', 'name', 'role']))
}

/**
 * Type guard for task list response
 */
export function isTaskListResponse(response: unknown): response is TweekApiTaskListResponse {
  return validateApiResponse(response, ['pageSize', 'data'])
    && Array.isArray((response as Record<string, unknown>).data)
}

/**
 * Type guard for single task response
 */
export function isTaskResponse(response: unknown): response is TweekApiTask {
  return validateApiResponse(response, ['id', 'calendarId', 'text'])
}

/**
 * Type guard for custom colors response
 */
export function isCustomColorsResponse(response: unknown): response is { colors: TweekApiCustomColor[] } {
  return validateApiResponse(response, ['colors'])
    && Array.isArray((response as Record<string, unknown>).colors)
}

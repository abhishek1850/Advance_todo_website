import type { Task, UserProfile, CompletionRecord, TaskPriority, EnergyLevel } from '../types';
import { parseISO, isToday, isBefore, startOfDay } from 'date-fns';

interface DailyPlanTask {
    title: string;
    reason: string;
    priority: TaskPriority;
    estimatedTime: number; // in minutes
    taskId: string;
    energyLevel: EnergyLevel;
}

interface DailyPlan {
    dailyPlan: DailyPlanTask[];
    totalEstimatedTime: number; // in minutes
    advice: string;
}

export function generateDailyPlan(tasks: Task[], profile: UserProfile, history: CompletionRecord[]): DailyPlan {
    const now = new Date();
    const todayStart = startOfDay(now);

    // Filter relevant tasks
    const relevantTasks = tasks.filter(t => !t.isCompleted);

    // Group tasks
    const overdue = relevantTasks.filter(t => t.dueDate && isBefore(parseISO(t.dueDate), todayStart));
    const dueToday = relevantTasks.filter(t => t.dueDate && isToday(parseISO(t.dueDate)));
    const recurring = relevantTasks.filter(t => t.recurrence === 'daily'); // Assuming these are already reset for today
    const backlog = relevantTasks.filter(t => !t.dueDate && t.priority !== 'low');

    // Calculate recent workload
    const recentHistory = history.slice(-7);
    const avgCompletion = recentHistory.length > 0
        ? recentHistory.reduce((acc, curr) => acc + curr.completed, 0) / recentHistory.length
        : 5;

    const failedYesterday = history.find(h => h.date === new Date(now.setDate(now.getDate() - 1)).toISOString().split('T')[0]);
    const yesterdayCompletionRate = failedYesterday ? (failedYesterday.completed / failedYesterday.total) : 1;

    // Determine target load
    let targetTasks = Math.max(3, Math.round(avgCompletion));
    if (yesterdayCompletionRate < 0.5) targetTasks = Math.max(3, targetTasks - 1); // Reduce load if struggling
    if (profile.currentStreak > 7) targetTasks += 1; // Challenge slightly if on streak
    targetTasks = Math.min(targetTasks, 7); // Cap at 7 as requested

    // Selection Logic (Greedy Approach)
    const selection: DailyPlanTask[] = [];
    let currentLoadMinutes = 0;
    const MAX_MINUTES = 8 * 60; // 8 hours max

    const addToPlan = (task: Task, reason: string) => {
        if (selection.some(s => s.taskId === task.id)) return;
        if (currentLoadMinutes + (task.estimatedMinutes || 30) > MAX_MINUTES) return;

        selection.push({
            taskId: task.id,
            title: task.title,
            reason: reason,
            priority: task.priority,
            estimatedTime: task.estimatedMinutes || 30, // Default 30 min
            energyLevel: task.energyLevel
        });
        currentLoadMinutes += task.estimatedMinutes || 30;
    };

    // 1. Must do: Overdue Critical/High
    overdue
        .filter(t => t.priority === 'critical' || t.priority === 'high')
        .forEach(t => addToPlan(t, "Overdue and high priority"));

    // 2. Must do: Today's Critical/High & Recurring
    dueToday
        .filter(t => t.priority === 'critical' || t.priority === 'high')
        .forEach(t => addToPlan(t, "Due today and important"));

    recurring
        .forEach(t => addToPlan(t, "Daily habit/routine"));

    // 3. Fill with Eisenhower Matrix (Important/Urgent) rest
    if (selection.length < targetTasks) {
        overdue
            .filter(t => !selection.some(s => s.taskId === t.id))
            .sort((a, b) => priorityScore(b.priority) - priorityScore(a.priority))
            .forEach(t => {
                if (selection.length < targetTasks) addToPlan(t, "Clearing backlog");
            });
    }

    if (selection.length < targetTasks) {
        dueToday
            .filter(t => !selection.some(s => s.taskId === t.id))
            .sort((a, b) => priorityScore(b.priority) - priorityScore(a.priority))
            .forEach(t => {
                if (selection.length < targetTasks) addToPlan(t, "Scheduled for today");
            });
    }

    // 4. Fill with Backlog (Important but not urgent)
    if (selection.length < targetTasks) {
        backlog
            .sort((a, b) => priorityScore(b.priority) - priorityScore(a.priority))
            .forEach(t => {
                if (selection.length < targetTasks) addToPlan(t, "Important backlog item");
            });
    }

    // Generate Advice
    let advice = "";
    if (overdue.length > 2) {
        advice = "You have a few overdue tasks. Let's focus on clearing those first to reduce mental clutter.";
    } else if (profile.currentStreak > 5) {
        advice = "You're on a great streak! Today's plan is designed to keep your momentum going without burnout.";
    } else if (yesterdayCompletionRate < 0.5) {
        advice = "It looks like yesterday was tough. I've lightened the load today so you can get back on track with some quick wins.";
    } else {
        advice = "This is a balanced plan mixing high-focus work with routine tasks. Start with the most difficult task first.";
    }

    return {
        dailyPlan: selection,
        totalEstimatedTime: currentLoadMinutes,
        advice
    };
}

function priorityScore(p: TaskPriority): number {
    switch (p) {
        case 'critical': return 4;
        case 'high': return 3;
        case 'medium': return 2;
        case 'low': return 1;
        default: return 0;
    }
}

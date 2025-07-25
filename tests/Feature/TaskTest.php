<?php

namespace Tests\Feature;

use App\Models\Task;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class TaskTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    public function test_home_page_displays_tasks(): void
    {
        // Create some test tasks
        Task::factory()->pending()->create(['title' => 'Pending Task']);
        Task::factory()->completed()->create(['title' => 'Completed Task']);

        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) =>
            $page->component('welcome')
                ->has('tasks', 2)
                ->has('tasks.0.title')
                ->has('tasks.0.completed')
                ->has('tasks.1.title')
                ->has('tasks.1.completed')
        );

        // Also verify tasks exist in database
        $this->assertDatabaseHas('tasks', ['title' => 'Pending Task', 'completed' => false]);
        $this->assertDatabaseHas('tasks', ['title' => 'Completed Task', 'completed' => true]);
    }

    public function test_can_create_task(): void
    {
        $taskData = [
            'title' => 'New Task'
        ];

        $response = $this->post('/tasks', $taskData);

        $response->assertStatus(200);
        $this->assertDatabaseHas('tasks', [
            'title' => 'New Task',
            'completed' => false
        ]);

        $response->assertInertia(fn (Assert $page) =>
            $page->component('welcome')
                ->has('tasks', 1)
                ->where('tasks.0.title', 'New Task')
                ->where('tasks.0.completed', false)
        );
    }

    public function test_create_task_validation_fails_with_empty_title(): void
    {
        $response = $this->post('/tasks', ['title' => '']);

        $response->assertSessionHasErrors(['title']);
        $this->assertDatabaseCount('tasks', 0);
    }

    public function test_create_task_validation_fails_with_long_title(): void
    {
        $response = $this->post('/tasks', [
            'title' => str_repeat('a', 256) // 256 characters
        ]);

        $response->assertSessionHasErrors(['title']);
        $this->assertDatabaseCount('tasks', 0);
    }

    public function test_can_toggle_task_completion(): void
    {
        $task = Task::factory()->pending()->create();

        $response = $this->patch("/tasks/{$task->id}", [
            'completed' => true
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'completed' => true
        ]);

        $response->assertInertia(fn (Assert $page) =>
            $page->component('welcome')
                ->has('tasks', 1)
                ->where('tasks.0.completed', true)
        );
    }

    public function test_can_toggle_task_back_to_pending(): void
    {
        $task = Task::factory()->completed()->create();

        $response = $this->patch("/tasks/{$task->id}", [
            'completed' => false
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'completed' => false
        ]);

        $response->assertInertia(fn (Assert $page) =>
            $page->component('welcome')
                ->has('tasks', 1)
                ->where('tasks.0.completed', false)
        );
    }

    public function test_can_update_task_title(): void
    {
        $task = Task::factory()->create(['title' => 'Original Title']);

        $response = $this->patch("/tasks/{$task->id}", [
            'title' => 'Updated Title'
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'title' => 'Updated Title'
        ]);
    }

    public function test_can_delete_task(): void
    {
        $task = Task::factory()->create();

        $response = $this->delete("/tasks/{$task->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('tasks', [
            'id' => $task->id
        ]);

        $response->assertInertia(fn (Assert $page) =>
            $page->component('welcome')
                ->has('tasks', 0)
        );
    }

    public function test_can_delete_multiple_tasks(): void
    {
        $task1 = Task::factory()->create(['title' => 'Task 1']);
        $task2 = Task::factory()->create(['title' => 'Task 2']);

        // Delete first task
        $response = $this->delete("/tasks/{$task1->id}");
        $response->assertStatus(200);

        // Verify only second task remains
        $response->assertInertia(fn (Assert $page) =>
            $page->component('welcome')
                ->has('tasks', 1)
                ->where('tasks.0.title', 'Task 2')
        );

        // Delete second task
        $response = $this->delete("/tasks/{$task2->id}");
        $response->assertStatus(200);

        // Verify no tasks remain
        $response->assertInertia(fn (Assert $page) =>
            $page->component('welcome')
                ->has('tasks', 0)
        );
    }

    public function test_task_scopes_work_correctly(): void
    {
        // Create test data
        Task::factory()->pending()->create(['title' => 'Pending 1']);
        Task::factory()->pending()->create(['title' => 'Pending 2']);
        Task::factory()->completed()->create(['title' => 'Completed 1']);

        // Test pending scope
        $pendingTasks = Task::pending()->get();
        $this->assertCount(2, $pendingTasks);
        $this->assertTrue($pendingTasks->every(fn($task) => !$task->completed));

        // Test completed scope
        $completedTasks = Task::completed()->get();
        $this->assertCount(1, $completedTasks);
        $this->assertTrue($completedTasks->every(fn($task) => $task->completed));
    }

    public function test_tasks_are_ordered_by_latest(): void
    {
        // Create tasks with specific timestamps - create older one first
        $oldTask = Task::factory()->create([
            'title' => 'Old Task',
            'created_at' => now()->subHours(2)
        ]);

        $newTask = Task::factory()->create([
            'title' => 'New Task',
            'created_at' => now()
        ]);

        $response = $this->get('/');

        $response->assertInertia(fn (Assert $page) =>
            $page->component('welcome')
                ->has('tasks', 2)
                ->where('tasks.0.title', 'New Task') // Should be first (latest)
                ->where('tasks.1.title', 'Old Task')  // Should be second
        );
    }
}
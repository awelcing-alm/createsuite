defmodule Backend.TasksTest do
  use Backend.DataCase, async: false

  alias Backend.{Agents, Tasks}

  test "assign_task_to_agent/2 updates task and runtime state" do
    assert {:ok, task} = Tasks.create_task(%{title: "Assigned task", priority: "medium"})

    assert {:ok, agent} =
             Agents.create_agent(%{
               name: "task-agent-#{:rand.uniform(99999)}",
               capabilities: ["backend"]
             })

    on_exit(fn -> Backend.Runtime.AgentRuntimeSupervisor.stop_agent(agent.id) end)

    assert {:ok, assigned_task} = Tasks.assign_task_to_agent(task.cs_id, agent.id)
    task_cs_id = assigned_task.cs_id

    assert assigned_task.assigned_agent_id == agent.id
    assert assigned_task.status == "in_progress"

    assert %{status: :working, current_task_id: ^task_cs_id} =
             Backend.Runtime.AgentRuntime.get_state(agent.id)
  end

  describe "get_task/1" do
    test "by cs_id returns task" do
      assert {:ok, task} = Tasks.create_task(%{title: "Find me", priority: "medium"})
      assert {:ok, found} = Tasks.get_task(task.cs_id)
      assert found.id == task.id
    end

    test "by UUID returns task" do
      assert {:ok, task} = Tasks.create_task(%{title: "Find me", priority: "medium"})
      assert {:ok, found} = Tasks.get_task(task.id)
      assert found.id == task.id
    end

    test "not found returns error" do
      assert {:error, :not_found} = Tasks.get_task("cs-99999")
    end
  end

  describe "update_task/2" do
    test "success - updates fields" do
      assert {:ok, task} = Tasks.create_task(%{title: "Original", priority: "medium"})
      assert {:ok, updated} = Tasks.update_task(task.id, %{title: "New Title"})
      assert updated.title == "New Title"
    end

    test "error - not found" do
      assert {:error, :not_found} = Tasks.update_task("cs-99999", %{title: "X"})
    end
  end

  describe "complete_task/1" do
    test "success - sets completed_at and completed status" do
      assert {:ok, task} = Tasks.create_task(%{title: "To complete", priority: "medium"})

      assert {:ok, agent} =
               Agents.create_agent(%{
                 name: "comp-agent-#{:rand.uniform(99999)}",
                 capabilities: ["x"]
               })

      on_exit(fn -> Backend.Runtime.AgentRuntimeSupervisor.stop_agent(agent.id) end)
      Tasks.assign_task(task.id, agent.id)
      assert {:ok, completed} = Tasks.complete_task(task.id)
      assert completed.status == "completed"
      assert completed.completed_at != nil
    end
  end

  describe "delete_task/1" do
    test "success - deletes task" do
      assert {:ok, task} = Tasks.create_task(%{title: "To delete", priority: "medium"})
      assert {:ok, _} = Tasks.delete_task(task.id)
      assert {:error, :not_found} = Tasks.get_task(task.id)
    end
  end

  describe "list_tasks/1" do
    test "with status filter returns matching tasks" do
      tasks = Tasks.list_tasks(%{"status" => "open"})
      assert Enum.all?(tasks, fn t -> t.status == "open" end)
    end

    test "without filter returns all" do
      tasks = Tasks.list_tasks(%{})
      assert is_list(tasks)
    end
  end
end

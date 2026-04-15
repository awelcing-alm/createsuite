defmodule BackendWeb.SystemChannelTest do
  use BackendWeb.ChannelCase, async: false

  alias Backend.Agents.Agent
  alias Backend.Tasks.Task

  setup do
    {:ok, _, socket} =
      socket(BackendWeb.AppSocket, %{}, %{})
      |> subscribe_and_join(BackendWeb.SystemChannel, "system")

    %{socket: socket}
  end

  describe "join" do
    test "joins the system channel successfully" do
      assert {:ok, _, _} =
               socket(BackendWeb.AppSocket, %{}, %{})
               |> subscribe_and_join(BackendWeb.SystemChannel, "system")
    end
  end

  describe "agent events" do
    test "pushes agent_created" do
      agent = %Agent{
        id: "test-id",
        name: "test-agent",
        status: "idle",
        capabilities: ["testing"],
        current_task_id: nil,
        inserted_at: DateTime.utc_now(),
        updated_at: DateTime.utc_now()
      }

      Phoenix.PubSub.broadcast(Backend.PubSub, "agents", {:agent_created, agent})

      assert_push("agent_created", %{"name" => "test-agent", "status" => "idle"})
    end

    test "pushes agent_updated" do
      agent = %Agent{
        id: "test-id",
        name: "test-agent",
        status: "working",
        capabilities: ["testing"],
        current_task_id: "task-1",
        inserted_at: DateTime.utc_now(),
        updated_at: DateTime.utc_now()
      }

      Phoenix.PubSub.broadcast(Backend.PubSub, "agents", {:agent_updated, agent})

      assert_push("agent_updated", %{"name" => "test-agent", "status" => "working"})
    end

    test "pushes agent_deleted" do
      Phoenix.PubSub.broadcast(Backend.PubSub, "agents", {:agent_deleted, "gone-id"})

      assert_push("agent_deleted", %{"id" => "gone-id"})
    end
  end

  describe "task events" do
    test "pushes task_created" do
      task = %Task{
        id: "task-uuid",
        cs_id: "cs-tst01",
        title: "Test task",
        description: "A test",
        status: "open",
        priority: "medium",
        tags: [],
        assigned_agent_id: nil,
        inserted_at: DateTime.utc_now(),
        updated_at: DateTime.utc_now()
      }

      Phoenix.PubSub.broadcast(Backend.PubSub, "tasks", {:task_created, task})

      assert_push("task_created", %{
        "id" => "cs-tst01",
        "title" => "Test task",
        "status" => "open"
      })
    end

    test "pushes task_completed" do
      task = %Task{
        id: "task-uuid",
        cs_id: "cs-tst02",
        title: "Done task",
        description: nil,
        status: "completed",
        priority: "high",
        tags: [],
        assigned_agent_id: nil,
        inserted_at: DateTime.utc_now(),
        updated_at: DateTime.utc_now()
      }

      Phoenix.PubSub.broadcast(Backend.PubSub, "tasks", {:task_completed, task})

      assert_push("task_completed", %{"id" => "cs-tst02", "status" => "completed"})
    end

    test "pushes task_assigned" do
      task = %Task{
        id: "task-uuid",
        cs_id: "cs-tst03",
        title: "Assigned task",
        description: nil,
        status: "in_progress",
        priority: "high",
        tags: [],
        assigned_agent_id: "agent-1",
        inserted_at: DateTime.utc_now(),
        updated_at: DateTime.utc_now()
      }

      Phoenix.PubSub.broadcast(Backend.PubSub, "tasks", {:task_assigned, task})

      assert_push("task_assigned", %{
        "id" => "cs-tst03",
        "status" => "in_progress",
        "assignedAgent" => "agent-1"
      })
    end

    test "pushes task_deleted" do
      Phoenix.PubSub.broadcast(Backend.PubSub, "tasks", {:task_deleted, "cs-del01"})

      assert_push("task_deleted", %{"id" => "cs-del01"})
    end
  end

  describe "convoy events" do
    test "pushes convoy_created" do
      convoy = %Backend.Convoys.Convoy{
        id: "convoy-uuid",
        cs_id: "cs-cv-tst1",
        name: "Test convoy",
        description: "A test convoy",
        inserted_at: DateTime.utc_now(),
        updated_at: DateTime.utc_now()
      }

      Phoenix.PubSub.broadcast(Backend.PubSub, "convoys", {:convoy_created, convoy})

      assert_push("convoy_created", %{"id" => "cs-cv-tst1", "name" => "Test convoy"})
    end

    test "pushes convoy_deleted" do
      Phoenix.PubSub.broadcast(Backend.PubSub, "convoys", {:convoy_deleted, "cs-cv-del1"})

      assert_push("convoy_deleted", %{"id" => "cs-cv-del1"})
    end
  end

  describe "system events" do
    test "pushes health_changed degraded" do
      Phoenix.PubSub.broadcast(Backend.PubSub, "system", {:health_changed, "degraded"})

      assert_push("health_changed", %{"status" => "degraded"})
    end

    test "pushes health_changed ok" do
      Phoenix.PubSub.broadcast(Backend.PubSub, "system", {:health_changed, "ok"})

      assert_push("health_changed", %{"status" => "ok"})
    end
  end
end

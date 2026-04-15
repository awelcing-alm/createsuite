defmodule BackendWeb.TaskControllerTest do
  use BackendWeb.ConnCase, async: false

  alias Backend.{Agents, Tasks}

  setup do
    {:ok, conn: Phoenix.ConnTest.build_conn()}
  end

  describe "GET /api/tasks" do
    test "returns list of tasks", %{conn: conn} do
      conn = get(conn, "/api/tasks")
      assert %{"success" => true, "data" => %{"tasks" => _}} = json_response(conn, 200)
    end

    test "supports status filter", %{conn: conn} do
      conn = get(conn, "/api/tasks?status=open")
      assert %{"success" => true, "data" => %{"tasks" => _tasks}} = json_response(conn, 200)
    end
  end

  describe "POST /api/tasks" do
    test "creates task returns 201", %{conn: conn} do
      conn = post(conn, "/api/tasks", %{title: "New task", priority: "high"})
      assert %{"success" => true, "data" => %{"task" => task}} = json_response(conn, 201)
      assert task["title"] == "New task"
    end

    test "returns 422 for missing title", %{conn: conn} do
      conn = post(conn, "/api/tasks", %{priority: "high"})
      assert %{"success" => false} = json_response(conn, 422)
    end
  end

  describe "GET /api/tasks/:id" do
    test "returns task by cs_id", %{conn: conn} do
      {:ok, task} = Tasks.create_task(%{title: "Find me", priority: "medium"})
      conn = get(conn, "/api/tasks/#{task.cs_id}")
      assert %{"success" => true, "data" => %{"task" => found}} = json_response(conn, 200)
      assert found["title"] == "Find me"
    end

    test "returns 404 for non-existent", %{conn: conn} do
      conn = get(conn, "/api/tasks/cs-99999")
      assert %{"success" => false} = json_response(conn, 404)
    end
  end

  describe "PATCH /api/tasks/:id" do
    test "updates task", %{conn: conn} do
      {:ok, task} = Tasks.create_task(%{title: "Original", priority: "medium"})
      conn = patch(conn, "/api/tasks/#{task.cs_id}", %{title: "Updated"})
      assert %{"success" => true, "data" => %{"task" => updated}} = json_response(conn, 200)
      assert updated["title"] == "Updated"
    end
  end

  describe "POST /api/tasks/:id/assign" do
    test "assigns agent and accepts agent_id", %{conn: conn} do
      {:ok, task} = Tasks.create_task(%{title: "Assign me", priority: "medium"})

      {:ok, agent} =
        Agents.create_agent(%{name: "assign-agent-#{:rand.uniform(99999)}", capabilities: ["x"]})

      on_exit(fn -> Backend.Runtime.AgentRuntimeSupervisor.stop_agent(agent.id) end)
      conn = post(conn, "/api/tasks/#{task.cs_id}/assign", %{"agent_id" => agent.id})
      assert %{"success" => true, "data" => %{"task" => assigned}} = json_response(conn, 200)
      assert assigned["status"] == "in_progress"
    end

    test "assigns agent and accepts agentId (camelCase)", %{conn: conn} do
      {:ok, task} = Tasks.create_task(%{title: "Assign me camel", priority: "medium"})

      {:ok, agent} =
        Agents.create_agent(%{name: "camel-agent-#{:rand.uniform(99999)}", capabilities: ["x"]})

      on_exit(fn -> Backend.Runtime.AgentRuntimeSupervisor.stop_agent(agent.id) end)
      conn = post(conn, "/api/tasks/#{task.cs_id}/assign", %{"agentId" => agent.id})
      assert %{"success" => true, "data" => %{"task" => assigned}} = json_response(conn, 200)
      assert assigned["status"] == "in_progress"
    end
  end

  describe "POST /api/tasks/:id/complete" do
    test "marks task completed", %{conn: conn} do
      {:ok, task} = Tasks.create_task(%{title: "Complete me", priority: "medium"})

      {:ok, agent} =
        Agents.create_agent(%{name: "comp-agent-#{:rand.uniform(99999)}", capabilities: ["x"]})

      on_exit(fn -> Backend.Runtime.AgentRuntimeSupervisor.stop_agent(agent.id) end)
      Tasks.assign_task(task.id, agent.id)
      conn = post(conn, "/api/tasks/#{task.cs_id}/complete")
      assert %{"success" => true, "data" => %{"task" => completed}} = json_response(conn, 200)
      assert completed["status"] == "completed"
    end
  end

  describe "DELETE /api/tasks/:id" do
    test "deletes task returns deleted:true", %{conn: conn} do
      {:ok, task} = Tasks.create_task(%{title: "Delete me", priority: "medium"})
      conn = delete(conn, "/api/tasks/#{task.cs_id}")
      assert %{"success" => true, "data" => %{"deleted" => true}} = json_response(conn, 200)
    end
  end
end

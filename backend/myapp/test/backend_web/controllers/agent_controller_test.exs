defmodule BackendWeb.AgentControllerTest do
  use BackendWeb.ConnCase, async: false

  alias Backend.Agents

  setup do
    {:ok, conn: Phoenix.ConnTest.build_conn()}
  end

  describe "GET /api/agents" do
    test "returns list of agents", %{conn: conn} do
      conn = get(conn, "/api/agents")
      assert %{"success" => true, "data" => %{"agents" => _}} = json_response(conn, 200)
    end
  end

  describe "POST /api/agents" do
    test "creates agent returns 201 and starts runtime", %{conn: conn} do
      conn =
        post(conn, "/api/agents", %{
          name: "new-agent-#{:rand.uniform(99999)}",
          capabilities: ["frontend"]
        })

      assert %{"success" => true, "data" => %{"agent" => agent}} = json_response(conn, 201)
      assert agent["name"] =~ "new-agent"
      assert agent["capabilities"] == ["frontend"]
      assert agent["status"] == "idle"
    end

    test "returns 422 for missing name", %{conn: conn} do
      conn = post(conn, "/api/agents", %{capabilities: ["x"]})
      assert %{"success" => false} = json_response(conn, 422)
    end
  end

  describe "GET /api/agents/:id" do
    test "returns agent by UUID", %{conn: conn} do
      {:ok, agent} =
        Agents.create_agent(%{name: "get-agent-#{:rand.uniform(99999)}", capabilities: ["x"]})

      on_exit(fn -> Backend.Runtime.AgentRuntimeSupervisor.stop_agent(agent.id) end)
      conn = get(conn, "/api/agents/#{agent.id}")
      assert %{"success" => true, "data" => %{"agent" => found}} = json_response(conn, 200)
      assert found["name"] =~ "get-agent-"
    end

    test "returns 404 for non-existent", %{conn: conn} do
      conn = get(conn, "/api/agents/00000000-0000-0000-0000-000000000001")
      assert %{"success" => false} = json_response(conn, 404)
    end
  end

  describe "PATCH /api/agents/:id" do
    test "updates agent status", %{conn: conn} do
      {:ok, agent} =
        Agents.create_agent(%{name: "upd-agent-#{:rand.uniform(99999)}", capabilities: ["x"]})

      on_exit(fn -> Backend.Runtime.AgentRuntimeSupervisor.stop_agent(agent.id) end)
      conn = patch(conn, "/api/agents/#{agent.id}", %{status: "offline"})
      assert %{"success" => true, "data" => %{"agent" => updated}} = json_response(conn, 200)
      assert updated["status"] == "offline"
    end
  end

  describe "DELETE /api/agents/:id" do
    test "deletes agent returns deleted:true", %{conn: conn} do
      {:ok, agent} =
        Agents.create_agent(%{name: "del-agent-#{:rand.uniform(99999)}", capabilities: ["x"]})

      agent_id = agent.id
      conn = delete(conn, "/api/agents/#{agent_id}")
      assert %{"success" => true, "data" => %{"deleted" => true}} = json_response(conn, 200)
    end
  end
end

defmodule BackendWeb.MessageControllerTest do
  use BackendWeb.ConnCase, async: false

  alias Backend.Agents
  alias Backend.Messaging

  setup do
    {:ok, agent} =
      Agents.create_agent(%{name: "msg-test-#{:rand.uniform(99999)}", capabilities: ["test"]})

    on_exit(fn -> Backend.Runtime.AgentRuntimeSupervisor.stop_agent(agent.id) end)

    {:ok, conn: Phoenix.ConnTest.build_conn()}
    |> then(fn {:ok, conn: conn} -> {:ok, agent: agent, conn: conn} end)
  end

  describe "GET /api/mailbox" do
    test "returns all messages", %{conn: conn} do
      conn = get(conn, "/api/mailbox")
      assert %{"success" => true, "data" => %{"messages" => _}} = json_response(conn, 200)
    end
  end

  describe "GET /api/agents/:id/messages" do
    test "returns messages for agent", %{conn: conn, agent: agent} do
      Messaging.send_message(agent.id, %{content: "hello"})
      conn = get(conn, "/api/agents/#{agent.id}/messages")
      assert %{"success" => true, "data" => %{"messages" => msgs}} = json_response(conn, 200)
      assert Enum.all?(msgs, fn m -> m["agentId"] == agent.id end)
    end
  end

  describe "GET /api/agents/:id/messages/unread" do
    test "returns only unread messages", %{conn: conn, agent: agent} do
      Messaging.send_message(agent.id, %{content: "unread"})
      conn = get(conn, "/api/agents/#{agent.id}/messages/unread")
      assert %{"success" => true, "data" => %{"messages" => msgs}} = json_response(conn, 200)
      assert Enum.all?(msgs, fn m -> m["read"] == false end)
    end
  end

  describe "POST /api/agents/:id/messages" do
    test "creates message returns 201", %{conn: conn, agent: agent} do
      conn =
        post(conn, "/api/agents/#{agent.id}/messages", %{content: "new message", sender: "alice"})

      assert %{"success" => true, "data" => %{"message" => msg}} = json_response(conn, 201)
      assert msg["content"] == "new message"
      assert msg["sender"] == "alice"
    end
  end

  describe "PATCH /api/messages/:id/read" do
    test "marks message as read", %{conn: conn, agent: agent} do
      {:ok, message} = Messaging.send_message(agent.id, %{content: "to mark"})
      conn = patch(conn, "/api/messages/#{message.id}/read")
      assert %{"success" => true, "data" => %{"message" => updated}} = json_response(conn, 200)
      assert updated["read"] == true
    end
  end
end

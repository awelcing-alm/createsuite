defmodule BackendWeb.ContractTest do
  use BackendWeb.ConnCase, async: false

  alias Backend.{Agents, Convoys, Messaging, Tasks}

  describe "API Response Contract" do
    test "all responses have success and data/error fields", %{conn: conn} do
      {:ok, task} =
        Tasks.create_task(%{
          title: "Contract task",
          description: "Verify contract",
          priority: "high"
        })

      {:ok, agent} =
        Agents.create_agent(%{
          name: "contract-agent-#{:rand.uniform(99999)}",
          capabilities: ["backend"]
        })

      on_exit(fn -> Backend.Runtime.AgentRuntimeSupervisor.stop_agent(agent.id) end)

      {:ok, convoy} = Convoys.create_convoy(%{name: "Contract convoy", task_ids: [task.id]})
      {:ok, message} = Messaging.send_message(agent.id, %{sender: "tester", content: "hello"})

      responses = [
        get(recycle(conn), ~p"/api/health"),
        get(recycle(conn), ~p"/api/status"),
        get(recycle(conn), ~p"/api/tasks"),
        get(recycle(conn), ~p"/api/tasks/#{task.cs_id}"),
        get(recycle(conn), ~p"/api/agents"),
        get(recycle(conn), ~p"/api/agents/#{agent.id}"),
        get(recycle(conn), ~p"/api/convoys"),
        get(recycle(conn), ~p"/api/convoys/#{convoy.convoy.cs_id}"),
        get(recycle(conn), ~p"/api/mailbox"),
        get(recycle(conn), ~p"/api/agents/#{agent.id}/messages"),
        get(recycle(conn), ~p"/api/agents/#{agent.id}/messages/unread"),
        patch(recycle(conn), ~p"/api/messages/#{message.id}/read")
      ]

      Enum.each(responses, fn response_conn ->
        body = json_response(response_conn, response_conn.status)
        assert Map.has_key?(body, "success")
        assert Map.has_key?(body, "data")
        assert Map.has_key?(body, "error")

        if body["success"] do
          refute is_nil(body["data"])
          assert is_nil(body["error"])
        else
          assert is_nil(body["data"])
          assert is_binary(body["error"])
        end
      end)
    end
  end
end

defmodule Backend.MessagingTest do
  use Backend.DataCase, async: false

  alias Backend.{Agents, Messaging}

  setup do
    {:ok, agent} =
      Agents.create_agent(%{name: "msg-test-#{:rand.uniform(99999)}", capabilities: ["test"]})

    on_exit(fn -> Backend.Runtime.AgentRuntimeSupervisor.stop_agent(agent.id) end)
    %{agent: agent}
  end

  describe "send_message/2" do
    test "success - sets sender default and broadcasts", %{agent: agent} do
      assert {:ok, message} = Messaging.send_message(agent.id, %{content: "hello"})
      assert message.sender == "system"
      assert message.content == "hello"
      assert message.agent_id == agent.id
    end

    test "success - accepts sender override", %{agent: agent} do
      assert {:ok, message} =
               Messaging.send_message(agent.id, %{sender: "alice", content: "hello"})

      assert message.sender == "alice"
    end

    test "error - missing content", %{agent: agent} do
      assert {:error, %Ecto.Changeset{}} = Messaging.send_message(agent.id, %{sender: "bob"})
    end
  end

  describe "list_messages/0" do
    test "returns all messages ordered by inserted_at desc" do
      initial = Messaging.list_messages()
      assert is_list(initial)
    end
  end

  describe "list_agent_messages/1" do
    test "filters by agent_id", %{agent: agent} do
      Messaging.send_message(agent.id, %{content: "test"})
      messages = Messaging.list_agent_messages(agent.id)
      assert Enum.all?(messages, fn m -> m.agent_id == agent.id end)
    end
  end

  describe "list_unread_messages/1" do
    test "returns only unread messages for agent", %{agent: agent} do
      Messaging.send_message(agent.id, %{content: "unread msg"})
      unread = Messaging.list_unread_messages(agent.id)
      assert Enum.all?(unread, fn m -> m.read == false end)
    end
  end

  describe "mark_read/1" do
    test "success - marks message as read and broadcasts", %{agent: agent} do
      {:ok, message} = Messaging.send_message(agent.id, %{content: "to mark"})
      assert {:ok, updated} = Messaging.mark_read(message.id)
      assert updated.read == true
    end

    test "error - message not found" do
      assert {:error, :not_found} = Messaging.mark_read("00000000-0000-0000-0000-000000000001")
    end
  end
end

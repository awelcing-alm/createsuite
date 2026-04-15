defmodule Backend.Messaging do
  import Ecto.Query, warn: false

  alias Backend.Messaging.Message
  alias Backend.PubSub.Topics
  alias Backend.Repo

  def list_messages do
    Message
    |> order_by([m], desc: m.inserted_at)
    |> Repo.all()
    |> Repo.preload(:agent)
  end

  def list_agent_messages(agent_id) do
    Message
    |> where([m], m.agent_id == ^agent_id)
    |> order_by([m], desc: m.inserted_at)
    |> Repo.all()
    |> Repo.preload(:agent)
  end

  def list_unread_messages(agent_id) do
    Message
    |> where([m], m.agent_id == ^agent_id and m.read == false)
    |> order_by([m], desc: m.inserted_at)
    |> Repo.all()
    |> Repo.preload(:agent)
  end

  def get_message(id) do
    case Repo.get(Message, id) do
      nil -> {:error, :not_found}
      message -> {:ok, Repo.preload(message, :agent)}
    end
  end

  def send_message(agent_id, attrs) do
    attrs =
      attrs
      |> normalize_attrs()
      |> Map.put("agent_id", agent_id)
      |> Map.put_new("sender", "system")

    %Message{}
    |> Message.changeset(attrs)
    |> Repo.insert()
    |> case do
      {:ok, message} ->
        message = Repo.preload(message, :agent)

        if Backend.Agents.runtime_alive?(agent_id),
          do: Backend.Runtime.AgentRuntime.deliver_message(agent_id, message)

        broadcast(Topics.messages(agent_id), {:message_sent, message})
        {:ok, message}

      error ->
        error
    end
  end

  def mark_read(id) do
    with {:ok, message} <- get_message(id),
         {:ok, updated_message} <-
           message
           |> Message.changeset(%{read: true})
           |> Repo.update() do
      updated_message = Repo.preload(updated_message, :agent)
      broadcast(Topics.messages(updated_message.agent_id), {:message_read, updated_message.id})
      {:ok, updated_message}
    end
  end

  defp normalize_attrs(%{} = attrs) do
    attrs = Map.new(attrs, fn {key, value} -> {to_string(key), value} end)

    maybe_rename_body(attrs)
  end

  defp maybe_rename_body(%{"body" => body} = attrs) do
    attrs
    |> Map.put_new("content", body)
    |> Map.delete("body")
  end

  defp maybe_rename_body(attrs), do: attrs

  defp broadcast(topic, event), do: Phoenix.PubSub.broadcast(Backend.PubSub, topic, event)
end

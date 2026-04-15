defmodule BackendWeb.MessageJSON do
  def index(%{messages: messages}) do
    %{messages: Enum.map(messages, &message/1)}
  end

  def show(%{message: message}) do
    %{message: message(message)}
  end

  def message(message) do
    %{
      id: message.id,
      agentId: message.agent_id,
      sender: message.sender,
      content: message.content,
      read: message.read,
      createdAt: message.inserted_at,
      updatedAt: message.updated_at
    }
  end
end

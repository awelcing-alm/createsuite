defmodule BackendWeb.MessageController do
  use BackendWeb, :controller

  alias Backend.Messaging
  alias BackendWeb.{MessageJSON, ResponseJSON}

  action_fallback(BackendWeb.FallbackController)

  def index(conn, _params) do
    json(conn, ResponseJSON.success(MessageJSON.index(%{messages: Messaging.list_messages()})))
  end

  def agent_messages(conn, %{"id" => id}) do
    json(
      conn,
      ResponseJSON.success(MessageJSON.index(%{messages: Messaging.list_agent_messages(id)}))
    )
  end

  def unread(conn, %{"id" => id}) do
    json(
      conn,
      ResponseJSON.success(MessageJSON.index(%{messages: Messaging.list_unread_messages(id)}))
    )
  end

  def create(conn, %{"id" => id} = params) do
    with {:ok, message} <- Messaging.send_message(id, Map.delete(params, "id")) do
      conn
      |> put_status(:created)
      |> json(ResponseJSON.success(MessageJSON.show(%{message: message})))
    end
  end

  def mark_read(conn, %{"id" => id}) do
    with {:ok, message} <- Messaging.mark_read(id) do
      json(conn, ResponseJSON.success(MessageJSON.show(%{message: message})))
    end
  end
end

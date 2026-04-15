defmodule BackendWeb.MessageLive.Index do
  use BackendWeb, :live_view

  alias Backend.Messaging
  alias Backend.PubSub.Topics

  @impl true
  def mount(_params, _session, socket) do
    if connected?(socket) do
      Phoenix.PubSub.subscribe(Backend.PubSub, Topics.agents())
    end

    {:ok,
     socket
     |> assign(page_title: "Messages")
     |> stream(:messages, Messaging.list_messages())}
  end

  @impl true
  def handle_info(_event, socket) do
    {:noreply, stream(socket, :messages, Messaging.list_messages(), reset: true)}
  end

  @impl true
  def render(assigns) do
    ~H"""
    <Layouts.app flash={@flash}>
      <.header>
        Messages
        <:subtitle>Global mailbox.</:subtitle>
      </.header>

      <div id="messages" phx-update="stream" class="space-y-3">
        <div :for={{dom_id, message} <- @streams.messages} id={dom_id} class="card bg-base-200 p-4">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="font-medium">{message.sender}: {message.content}</p>
              <p class="text-sm opacity-70">{message.agent && message.agent.name}</p>
            </div>
            <div class="text-right text-sm">
              <p class={if message.read, do: "opacity-50", else: "font-semibold"}>
                {if message.read, do: "Read", else: "Unread"}
              </p>
              <p class="opacity-70">{format_date(message.inserted_at)}</p>
            </div>
          </div>
        </div>
        <p :if={@streams.messages == []} class="opacity-70">No messages.</p>
      </div>
    </Layouts.app>
    """
  end

  defp format_date(nil), do: ""
  defp format_date(dt), do: Calendar.strftime(dt, "%Y-%m-%d %H:%M")
end

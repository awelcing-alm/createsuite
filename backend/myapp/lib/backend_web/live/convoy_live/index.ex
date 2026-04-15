defmodule BackendWeb.ConvoyLive.Index do
  use BackendWeb, :live_view

  alias Backend.Convoys
  alias Backend.PubSub.Topics

  @impl true
  def mount(_params, _session, socket) do
    if connected?(socket) do
      Phoenix.PubSub.subscribe(Backend.PubSub, Topics.convoys())
      Phoenix.PubSub.subscribe(Backend.PubSub, Topics.tasks())
    end

    {:ok,
     socket
     |> assign(page_title: "Convoys")
     |> stream(:convoys, Convoys.list_convoys())}
  end

  @impl true
  def handle_info(_event, socket) do
    {:noreply, stream(socket, :convoys, Convoys.list_convoys(), reset: true)}
  end

  @impl true
  def render(assigns) do
    ~H"""
    <Layouts.app flash={@flash}>
      <.header>
        Convoys
        <:subtitle>Grouped task execution progress.</:subtitle>
      </.header>

      <div id="convoys" phx-update="stream" class="space-y-3">
        <div :for={{dom_id, wrapped} <- @streams.convoys} id={dom_id} class="card bg-base-200 p-4">
          <div class="flex items-start justify-between gap-4">
            <div>
              <.link navigate={~p"/dashboard/convoys/#{wrapped.convoy.cs_id}"} class="font-semibold underline">
                {wrapped.convoy.name}
              </.link>
              <p class="text-sm opacity-70">{wrapped.convoy.cs_id}</p>
            </div>
            <p class="text-sm">{wrapped.progress.completed}/{wrapped.progress.total}</p>
          </div>
        </div>
      </div>
    </Layouts.app>
    """
  end
end

defmodule BackendWeb.ConvoyLive.Show do
  use BackendWeb, :live_view

  alias Backend.Convoys
  alias Backend.PubSub.Topics

  @impl true
  def mount(%{"id" => id}, _session, socket) do
    if connected?(socket) do
      Phoenix.PubSub.subscribe(Backend.PubSub, Topics.convoys())
      Phoenix.PubSub.subscribe(Backend.PubSub, Topics.tasks())
    end

    {:ok, load_convoy(socket, id)}
  end

  @impl true
  def handle_info(_event, socket) do
    {:noreply, load_convoy(socket, socket.assigns.convoy_id)}
  end

  @impl true
  def render(assigns) do
    ~H"""
    <Layouts.app flash={@flash}>
      <.header>
        {@convoy.convoy.name}
        <:subtitle>{@convoy.convoy.cs_id}</:subtitle>
        <:actions>
          <.button navigate={~p"/dashboard/convoys"}>Back to convoys</.button>
        </:actions>
      </.header>

      <div class="space-y-3">
        <div class="card bg-base-200 p-4">
          <p><strong>Description:</strong> {@convoy.convoy.description || "No description"}</p>
          <p><strong>Progress:</strong> {@convoy.progress.completed}/{@convoy.progress.total}</p>
        </div>

        <div class="card bg-base-200 p-4">
          <p class="font-semibold mb-2">Tasks</p>
          <ul class="space-y-1">
            <li :for={task <- @convoy.tasks}>
              <.link navigate={~p"/dashboard/tasks/#{task.cs_id}"} class="underline">{task.title}</.link>
            </li>
            <li :if={@convoy.tasks == []} class="opacity-70">No tasks in this convoy.</li>
          </ul>
        </div>
      </div>
    </Layouts.app>
    """
  end

  defp load_convoy(socket, id) do
    case Convoys.get_convoy(id) do
      {:ok, convoy} ->
        assign(socket, page_title: convoy.convoy.name, convoy: convoy, convoy_id: id)

      {:error, :not_found} ->
        push_navigate(put_flash(socket, :error, "Convoy not found"), to: ~p"/dashboard/convoys")
    end
  end
end

from .procedure import Procedure, load_spec, match_task_text


def procedure_factory(proc_id: str, mode: str):
    spec = load_spec(proc_id)

    def build(case):
        return Procedure(case=case, spec=spec, mode=mode)

    return build


__all__ = ["Procedure", "load_spec", "procedure_factory", "match_task_text"]

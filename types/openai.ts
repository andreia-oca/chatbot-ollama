export interface OpenAiModel {
    name: string;
}

export enum OpenAiModelID {
    DEFAULTMODEL = 'gpt-4'
}

export const fallbackModelID = OpenAiModelID.DEFAULTMODEL;

export const OpenAiModels: Record<OpenAiModelID, OpenAiModel> = {
    [OpenAiModelID.DEFAULTMODEL]: {
        name: 'gpt-4',
    },
};
